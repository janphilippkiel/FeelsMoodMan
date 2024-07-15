'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { EngagementAreaChart } from '@/components/engagement-area-chart';
import { EmotionRadarChart } from '@/components/emotion-radar-chart';
import { analyzeEmotions } from '@/utils/analytics';

interface StreamData {
  viewerCount: number;
  gameName: string;
  startedAt: string;
  uptimeInSeconds: number;
}

interface Message {
  author: string;
  text: string;
  sentiment: string;
  score: number;
}

export default function Home() {
  const { channel } = useParams<{ channel: string }>();
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
  });

  // Create a reference to the worker object
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (channel && !worker.current) {
      setCurrentChannel(channel);

      // Create the worker if it does not yet exist
      worker.current = new Worker(new URL('..//worker.tsx', import.meta.url), {
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
    //   return () => {
    //     if (worker.current) {
    //       worker.current.removeEventListener('message', onMessageReceived);
    //       worker.current.terminate();
    //       worker.current = null;
    //     }
    //   };
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

        // Fetch Twitch stream data using access token
        fetchTwitchStreams(accessToken);

        // Poll Twitch stream data every 30 seconds
        setInterval(() => {
          fetchTwitchStreams(accessToken);
        }, 30000);
      } catch (error) {
        console.error('Error fetching Twitch access token:', error);
        // Handle errors
      }
    };

    // Fetch Twitch stream data
    const fetchTwitchStreams = async (accessToken: string) => {
      try {
        const url = `https://api.twitch.tv/helix/streams?user_login=${channel}`;
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
        if (data.data.length > 0) {
          const { viewer_count, game_name, started_at } = data.data[0];

          // Set stream data
          setStreamData((prevStreamData) => ({
            ...prevStreamData,
            viewerCount: viewer_count,
            gameName: game_name,
            startedAt: started_at,
          }));

          // Start updating uptime every second
          startUptimeUpdater(started_at);
        } else {
          setStreamData({
            viewerCount: 0,
            gameName: '',
            startedAt: '',
            uptimeInSeconds: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching Twitch streams:', error);
        // Handle errors
      }
    };

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

    if (channel) {
      fetchAccessToken();
    }
  }, [channel]); // Dependency array includes channel to re-run effect if channel changes

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

  return (
    <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
         Twitch Chat of {currentChannel || '...'}
      </h1>
      <p className="leading-7">
        Once upon a time, in a far-off land, there was a very lazy king who
        spent all day lounging on his throne. One day, his advisors came to him
        with a problem: the kingdom was running out of money.
      </p>

      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2 lg:pr-2">
          <iframe
            className="w-full h-96 border border-gray-300 rounded"
            src={`https://player.twitch.tv/?channel=${currentChannel}&parent=localhost&parent=feelsmoodman.chat&muted=true`}
            title="Twitch Player"
          ></iframe>
          <div className="mt-4 flex justify-between">
            <span className="text-left">Currently streaming {streamData.gameName} for {streamData.viewerCount} viewers.</span>
            <span className="text-right" title={'Live since ' + new Date(streamData.startedAt).toLocaleString()}>Uptime: {formatUptime(streamData.uptimeInSeconds)}</span>
          </div>
        </div>

        <div className="lg:w-1/2 lg:pl-2 mt-4 lg:mt-0">
          <div className="min-w-50 p-2 border border-gray-300 rounded bg-white h-96 overflow-y-auto resize-y">
            {messages.slice(0).reverse().map((msg, index) => (
              <p key={index} className={getColor(msg.sentiment)}>
                {!ready || messages.length === 0 ? 'Loading...' : (
                  <>
                    {getEmoji(msg.sentiment)}{' '}
                    <span className="font-bold">{msg.author}: </span>
                    {msg.text}{' '}
                    {['joy', 'surprise', 'anger', 'fear', 'disgust', 'sadness'].includes(msg.sentiment) && (
                      <span className="text-xs">(Score: {msg.score.toFixed(4)})</span>
                    )}
                  </>
                )}
              </p>
            ))}
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
