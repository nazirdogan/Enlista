import { Config } from 'remotion';

Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setBitrate('5000k');
Config.setFps(30);

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const FPS = 30;
