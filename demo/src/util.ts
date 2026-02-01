import { types } from 'mime-types';

export function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'application/octet-stream';
    return types[ext] ?? 'application/octet-stream';
}