import { pipeline, env } from "@xenova/transformers";
import tmi from 'tmi.js';

// Skip local model check
env.allowLocalModels = false;

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
    //static model = 'j-hartmann/emotion-english-distilroberta-base';
    //static model = 'Xenova/twitter-roberta-base-sentiment-latest';
    static model: string = 'Bachkippe/emotion-english-distilroberta-base_onnx';
    static instance: any = null;

    static async getInstance(progress_callback: any = null): Promise<any> {
        if (this.instance === null) {
            this.instance = pipeline('text-classification', this.model, { progress_callback });
        }
        return this.instance;
    }
}

import { emoteData } from '../utils/emotes';
import { timeStamp } from "console";

// Utility function to escape special characters in a string for use in a regular expression
const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  export const replaceEmotes = (input: string): string => {
    let output = input;
    emoteData.forEach(emote => {
      const regex = new RegExp(`\\b${escapeRegExp(emote.Emote)}\\b`, 'g');
      output = output.replace(regex, `[${emote.Description}]`);
    });
    return output;
  };

// Initial Twitch bot configuration
let opts: any = {
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
    channels: []
};

let client: any = null;

// Connect to Twitch
const connectToTwitch = (channel: string): void => {
    opts.channels = [channel];
    client = new tmi.Client(opts);

    client.on('message', async (target: string, context: any, msg: string, self: boolean) => {
        if (self) { return; } // Ignore messages from the bot
        // console.log(context);

        // Retrieve the classification pipeline
        let classifier = await PipelineSingleton.getInstance();

        // Perform the classification
        let output = await classifier(replaceEmotes(msg.trim()));
        // console.log(output[0])

        // Send the output back to the main thread
        globalThis.postMessage({
            status: 'complete',
            user: context['display-name'],
            message: msg.trim(),
            sentiment: output[0],
            date: new Date(Number(context['tmi-sent-ts'])),
            timestamp: context['tmi-sent-ts'],  // UNIX timestamp in this format "1721242110578"
            subscriber: context['subscriber'],
            firstMessage: context['first-msg'],
            returningChatter: context['returning-chatter'],
        });
    });

    client.on('connected', (addr: string, port: number) => {
        globalThis.postMessage({
            status: 'connected',
            message: `* Connected to ${addr}:${port}`
        });
    });

    client.connect();
};

// Listen for messages from the main thread
globalThis.onmessage = (e: any) => {
    if (e.data.type === 'setChannel') {
        const { channel } = e.data;
        connectToTwitch(channel);
    }
};