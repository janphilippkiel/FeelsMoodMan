// Define the emotion data structure
interface EmotionData {
  emotion: string;
  previous: number;
  current: number;
}

// Sample emotion data
const emotionData: EmotionData[] = [
  { emotion: "Joy 😀", previous: 0, current: 0 },
  { emotion: "Anger 🤬", previous: 0, current: 0 },
  { emotion: "Sadness 😭", previous: 0, current: 0 },
  { emotion: "Fear 😨", previous: 0, current: 0 },
  { emotion: "Disgust 🤢", previous: 0, current: 0 },
  { emotion: "Surprise 😲", previous: 0, current: 0 },
  // { emotion: "Neutral 😐", previous: 0, current: 0 },
];

// Message interface
interface Message {
  author: string;
  text: string;
  sentiment: string; // Assuming sentiment is one of 'joy', 'anger', 'sadness', 'fear', 'disgust', 'surprise', 'neutral'
  score: number;
}

// Function to analyze emotions in messages
export const analyzeEmotions = (messages: Message[]): EmotionData[] => {
  // Map of emotions to track and their corresponding labels
  const emotionsToTrack: { [key: string]: string } = {
    'joy': 'Joy 😀',
    'anger': 'Anger 🤬',
    'sadness': 'Sadness 😭',
    'fear': 'Fear 😨',
    'disgust': 'Disgust 🤢',
    'surprise': 'Surprise 😲',
    // 'neutral': 'Neutral 😐',
  };

  // Count occurrences of each emotion
  const emotionCounts: { [key: string]: number } = {};
  messages.forEach(msg => {
    if (emotionsToTrack[msg.sentiment.toLowerCase()]) {
      emotionCounts[msg.sentiment.toLowerCase()] = (emotionCounts[msg.sentiment.toLowerCase()] || 0) + 1;
    }
  });

  // Update the emotionData array with current counts
  emotionData.forEach(emotion => {
    const emotionKey = emotion.emotion.split(' ')[0].toLowerCase(); // Extracting the emotion key ('joy', 'anger', etc.)
    if (emotionCounts[emotionKey] !== undefined) {
      emotion.current = emotionCounts[emotionKey];
    }
  });

  return emotionData;
};
