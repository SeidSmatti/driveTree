export interface FileNode {
	id: string;
	name: string;
	mimeType: string;
	size: number;
	modifiedTime: string;
	isFolder: boolean;
	children: FileNode[] | null; // null = not loaded, [] = loaded + empty
}

export interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	size?: string;
	modifiedTime?: string;
}

export interface DriveListResponse {
	files: DriveFile[];
	nextPageToken?: string;
}
