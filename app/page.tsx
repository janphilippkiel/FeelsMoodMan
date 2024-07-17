'use client';

import { useState, useEffect, useRef } from 'react';
// import { useParams } from 'next/navigation';
import { EngagementAreaChart } from '@/components/engagement-area-chart';
import { EmotionRadarChart } from '@/components/emotion-radar-chart';
import { analyzeEmotions } from '@/utils/analytics';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StreamData {
  viewerCount: number;
  gameName: string;
  startedAt: string;
  uptimeInSeconds: number;
  userName: string;
  tags: string[];
}

interface Message {
  author: string;
  text: string;
  sentiment: string;
  score: number;
}

export default function Home() {
  // HINT: Unfortunately can't export SPA with dynamic params yet
  // See: https://github.com/vercel/next.js/discussions/55393
  // [channel]/page.tsx
  // const { channel } = useParams<{ channel: string }>();
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);

  // Track classification result and model loading status
  const [messages, setMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean | null>(null);

  // State to hold current stream data
  const [streamData, setStreamData] = useState<StreamData>({
    viewerCount: 0,
    gameName: '',
    startedAt: '',
    uptimeInSeconds: 0,
    userName: '',
    tags: [],
  });

  // State to track if the stream is offline or loading
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State to hold top 10 streams data
  const [topStreams, setTopStreams] = useState<StreamData[]>([]);

  // State to hold the Twitch access token
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Create a reference to the worker object
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    // This runs only on the client side
    const params = new URLSearchParams(window.location.search);
    const channel = params.get('channel');

    if (channel && !worker.current) {
      setCurrentChannel(channel);

      // Create the worker if it does not yet exist
      worker.current = new Worker(new URL('./worker.tsx', import.meta.url), {
        type: 'module',
      });

      // Callback function for messages from worker thread
      const onMessageReceived = (e: MessageEvent) => {
        switch (e.data.status) {
          case 'initiate':
            setReady(false);
            break;
          case 'connected':
            console.log(e.data.message);
            break;
          case 'complete':
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                author: e.data.author,
                text: e.data.message,
                sentiment: e.data.sentiment.label,
                score: e.data.sentiment.score,
              },
            ]);
            setReady(true);
            break;
        }
      };

      // Attach callback as event listener
      worker.current.addEventListener('message', onMessageReceived);

      // Send channel name to worker
      worker.current.postMessage({ type: 'setChannel', channel });

      // Cleanup function when component unmounts
      // Seems to break the Twitch API calls
      // return () => {
      //   if (worker.current) {
      //     worker.current.removeEventListener('message', onMessageReceived);
      //     worker.current.terminate();
      //     worker.current = null;
      //   }
      // };
    }

    // Fetch Twitch credentials
    const fetchAccessToken = async () => {
      try {
        const tokenUrl = 'https://id.twitch.tv/oauth2/token';

        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '',
            client_secret: process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET || '',
            grant_type: 'client_credentials',
          }).toString(),
        });

        if (!response.ok) {
          throw new Error('Failed to obtain Twitch access token');
        }

        const data = await response.json();
        const accessToken = data.access_token;
        setAccessToken(accessToken);

      } catch (error) {
        console.error('Error fetching Twitch access token:', error);
        // Handle errors
      }
    };

    fetchAccessToken();
  }, []);

  useEffect(() => {
    if (accessToken) {
      const fetchTwitchStreams = async (user_login?: string) => {
        try {
          let url = 'https://api.twitch.tv/helix/streams';
          if (user_login) {
            url += `?user_login=${user_login}`;
          } else {
            url += '?language=en';
          }

          const response = await fetch(url, {
            headers: {
              'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '',
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch Twitch streams');
          }

          const data = await response.json();

          // Update stream data
          if (user_login) {
            if (data.data.length > 0) {
              const { viewer_count, game_name, started_at, user_name, tags } = data.data[0];

              // Set stream data
              setStreamData((prevStreamData) => ({
                ...prevStreamData,
                viewerCount: viewer_count,
                gameName: game_name,
                startedAt: started_at,
                userName: user_name,
                tags: tags,
              }));

              // Set the stream status to online
              setIsOffline(false);

              // Start updating uptime every second
              startUptimeUpdater(started_at);
            } else {
              // Set the stream status to offline
              setIsOffline(true);

              setStreamData({
                viewerCount: 0,
                gameName: '',
                startedAt: '',
                uptimeInSeconds: 0,
                userName: '',
                tags: [],
              });
            }
          } else {
            // Set top streams data
            const topStreamsData = data.data.map((stream: any) => ({
              viewerCount: stream.viewer_count,
              gameName: stream.game_name,
              startedAt: stream.started_at,
              uptimeInSeconds: Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 1000),
              userName: stream.user_name,
              tags: stream.tags,
            }));
            setTopStreams(topStreamsData);
          }

          // Set loading to false after fetching stream data
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching Twitch streams:', error);
          // Handle errors
          setIsLoading(false);
        }
      };

      if (currentChannel) {
        fetchTwitchStreams(currentChannel);
      } else {
        // If no channel is provided, fetch top 10 streams
        fetchTwitchStreams();
      }
    }
  }, [accessToken, currentChannel]);

  // Start updating uptime
  const startUptimeUpdater = (startedAt: string) => {
    const interval = setInterval(() => {
      const startedTime = new Date(startedAt).getTime();
      const currentTime = Date.now();
      const uptimeInSeconds = Math.floor((currentTime - startedTime) / 1000);

      setStreamData((prevStreamData) => ({
        ...prevStreamData,
        uptimeInSeconds: uptimeInSeconds,
      }));
    }, 1000);

    return () => clearInterval(interval);
  };

  // Track the last non-neutral emotion
  const [lastNonNeutralSentiment, setLastNonNeutralSentiment] = useState('neutral');

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sentiment !== 'neutral') {
      setLastNonNeutralSentiment(lastMessage.sentiment);
    }
  }, [messages]);

  // Get color based on sentiment
  const getColor = (sentiment: string) => {
    switch (sentiment) {
      case 'joy':
        return 'text-green-600';
      case 'anger':
        return 'text-red-600';
      case 'sadness':
        return 'text-blue-600';
      case 'fear':
        return 'text-orange-600';
      case 'disgust':
        return 'text-yellow-600';
      case 'surprise':
        return 'text-purple-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-black';
    }
  };

  // Get emoji based on sentiment
  const getEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'joy':
        return '😀';
      case 'anger':
        return '🤬';
      case 'sadness':
        return '😭';
      case 'fear':
        return '😨';
      case 'disgust':
        return '🤢';
      case 'surprise':
        return '😲';
      case 'neutral':
        return '😐';
      default:
        return '';
    }
  };

  // Format uptime to HH:MM:SS
  const formatUptime = (uptimeInSeconds: number) => {
    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = uptimeInSeconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  // Render landing page if currentChannel is not set
  if (!currentChannel) {
    return (
      <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Measuring Emotions in Twitch Livestreams
        </h1>
        <p className="leading-7">
          Welcome to FeelsGoodMan, a prototype providing real-time emotion analysis of <a href="https://www.twitch.tv/directory" className="font-medium text-primary underline underline-offset-4" target="_blank">Twitch</a> chats to gain insights into viewer engagement.
        </p>
        <h2 className=" border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
          Features
        </h2>
        <ul className="ml-6 list-disc">
          <li>Sentiment Analysis: Get an immediate sense of the audience's mood with our sentiment analysis, categorizing messages into 6 basic emotions.</li>
          <li>Engagement Metrics: Track chat activity over time to see when your audience is most engaged.</li>
        </ul>
        <h2 className=" border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
          Usage
        </h2>
        <p className="leading-7">
          To view the chat and details of a specific stream append the channel name as a URL parameter, for example <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            https://feelsmoodman.chat/?channel={topStreams[0]?.userName || '<user_name>'}
          </code>. If no channel name is provided, the tool defaults to showing the top 20 most viewed streams in English. Click on the channel name to view the stream or enter the URL in the search bar at the top.</p>
        {topStreams.length > 0 && (
          <>
            <p className="leading-7">
              Below is an example table showing the top 20 most viewed streams. Click on the channel name to view more details about the stream:
            </p>
            <div className="rounded-lg border overflow-x-auto h-96">
              <Table className="shadow-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Channel</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Viewers</TableHead>
                    <TableHead className="text-right">Uptime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStreams.map((stream, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium"><a href={`?channel=${stream.userName}`}>{stream.userName}</a></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap">
                          <Badge className="mr-2 mb-2">{stream.gameName}</Badge>
                          {stream.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="mr-2 mb-2">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{stream.viewerCount}</TableCell>
                      <TableCell className="text-right">{formatUptime(stream.uptimeInSeconds)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
          Model
        </h2>
        <p className="leading-7">
          We utilize the <a href="https://huggingface.co/j-hartmann/emotion-english-distilroberta-base/" className="font-medium text-primary underline underline-offset-4" target="_blank">Emotion English DistilRoBERTa-base</a> model to classify emotions in Twitch chat messages. This model predicts Ekman's 6 basic emotions, plus a neutral class:</p>
          <ul className="">
            <li>🤬 anger</li>
            <li>🤢 disgust</li>
            <li>😨 fear</li>
            <li>😀 joy</li>
            <li>😐 neutral</li>
            <li>😭 sadness</li>
            <li>😲 surprise</li>
          </ul>
        <p className="leading-7">  
          This fine-tuned checkpoint of <a href="https://huggingface.co/distilroberta-base" className="font-medium text-primary underline underline-offset-4" target="_blank">DistilRoBERTa-base</a> has been trained on a diverse collection of text types from Twitter, Reddit, student self-reports, and TV dialogues. To further enhance our analysis, we replace Twitch emotes (an integral part of the sentiment) in messages before classification. For example, an emote like "4Head" would be replaced with "[laughing face with a wide grin]".
        </p>
        <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
          Architecture
        </h2>
        <p className="leading-7">
          Due to the large volume of chat messages, we opted for a client-side approach using <a href="https://huggingface.co/docs/transformers.js/index" className="font-medium text-primary underline underline-offset-4" target="_blank">Transformers.js</a> to run the model directly in the browser. We implemented this prototype as a <a href="https://nextjs.org/" className="font-medium text-primary underline underline-offset-4" target="_blank">Next.js</a> client-only Single Page Application (SPA). It integrates with Twitch chat using <a href="https://tmijs.com/" target="_blank">tmi.js</a> for real-time IRC connection in the browser. Frontend components are predominantly sourced from <a href="https://ui.shadcn.com/" target="_blank">shadcn/ui</a>, and <a href="https://recharts.org/" target="_blank">Recharts</a> is used for data visualization.
        </p>
        <h2 className=" border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
          Use Cases
        </h2>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          For Streamers
        </h3>
        <ul className="ml-6 list-disc">
          <li>Understand Audience Engagement: Track when your audience is most active and what kind of messages they are sending.</li>
          <li>Improve Content: Use sentiment analysis to gauge reactions to different parts of your stream and adjust your content accordingly.</li>
        </ul>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          For Advertisers</h3>
        <ul className="ml-6 list-disc">
          <li>Targeted Advertising: Identify popular streams and understand audience sentiment to target ads effectively.</li>
          <li>Content Sponsorship: Analyze viewer engagement and sentiment to align sponsorships with popular streams.</li>
        </ul>
        <h2 className=" border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
          Conclusion
        </h2>
        <p className="leading-7">
          FeelsMoodMan is a powerful tool for streamers and advertisers looking to gain deeper insights into Twitch streams and chat dynamics. Whether you're a streamer aiming to improve content or an advertiser seeking to target ads effectively, our tool provides the functionality and information you need.</p>
        <h2 className=" border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
          Contributors
        </h2>
        <p className="leading-7">This prototype was developed by Jannik Wolf and Jan-Philipp Kiel for the <a href="https://sites.google.com/view/coinseminar24/home" className="font-medium text-primary underline underline-offset-4" target="_blank">2024 COIN seminar</a> at the University of Cologne.</p>
      </main>
    );
  }

  // Render loading message while fetching stream data
  if (isLoading) {
    return (
      <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Fetching stream data from Twitch API...
        </h1>
      </main>
    );
  }

  // Render error page if stream is offline
  if (isOffline) {
    return (
      <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          The stream of {currentChannel} is currently offline.
        </h1>
        <p className="leading-7">
          Please check back later or try a different channel.
        </p>
      </main>
    );
  }

  return (
    <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {`${streamData.userName}'s Stream` || 'Loading stream data...'}{' '}
        {messages[messages.length - 1]?.sentiment !== 'neutral'
          ? getEmoji(messages[messages.length - 1]?.sentiment)
          : getEmoji(lastNonNeutralSentiment)
        }
      </h1>
      {streamData.gameName && streamData.tags && (
        <div className="flex flex-wrap">
          <Badge className="mr-2 mb-2">
            {streamData.gameName}
          </Badge>
          {streamData.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="mr-2 mb-2">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2 lg:pr-2">
          <iframe
            className="w-full h-96 rounded-lg border bg-card text-card-foreground shadow-sm"
            src={`https://player.twitch.tv/?channel=${currentChannel}&parent=localhost&parent=feelsmoodman.chat&muted=true`}
            title="Twitch Player"
          ></iframe>
          <div className="mt-4 flex justify-between">
            <span className="text-left">Currently streaming {streamData.gameName} for {streamData.viewerCount} viewers.</span>
            <span className="text-right" title={'Live since ' + new Date(streamData.startedAt).toLocaleString()}>Uptime: {formatUptime(streamData.uptimeInSeconds)}</span>
          </div>
        </div>

        <div className="lg:w-1/2 lg:pl-2 mt-4 lg:mt-0">
          <div className="min-w-50 space-y-0 rounded-lg border bg-card text-card-foreground shadow-sm h-96 p-6 overflow-y-auto">
            {!ready || messages.length === 0 ? (
              <p className="p-6">Building the text classification model in your browser...<br></br>
              Connecting to the chat...</p>
            ) : (
              <>
                {messages.slice(-100).reverse().map((msg, index) => (
                  <p key={index} className={getColor(msg.sentiment)}>
                    <>
                      {getEmoji(msg.sentiment)}{' '}
                      <span className="font-bold">{msg.author}: </span>
                      {msg.text}{' '}
                      {['joy', 'surprise', 'anger', 'fear', 'disgust', 'sadness'].includes(msg.sentiment) && (
                        <span className="text-xs">(Score: {msg.score.toFixed(4)})</span>
                      )}
                    </>
                  </p>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row mt-4">
        <div className="lg:w-2/3 lg:pr-2">
          <EngagementAreaChart />
        </div>
        <div className="lg:w-1/3 lg:pl-2 mt-4 lg:mt-0">
          <EmotionRadarChart data={analyzeEmotions(messages)} />
        </div>
      </div>
    </main>
  );
}
