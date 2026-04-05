// Polyfill Web API globals (Request, Response, Headers) for API route tests
import { Request, Response, Headers, fetch } from 'undici'
Object.assign(globalThis, { Request, Response, Headers, fetch })
