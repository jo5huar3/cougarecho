
export interface UploadedAlbum {
    name: string;
    songCount: number;
    streams: number;
    likesSaves: number;
    revenue: number;
}

export interface AlbumInfo {
    title: string;
    coverImage: File | null;
    songs: string[];
}
export const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const ALLOWED_AUDIO_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];