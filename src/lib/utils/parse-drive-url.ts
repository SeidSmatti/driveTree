const FOLDER_ID_RE = /^[a-zA-Z0-9_-]+$/;

const PATTERNS = [
	// https://drive.google.com/drive/folders/FOLDER_ID
	// https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing
	// https://drive.google.com/drive/u/0/folders/FOLDER_ID
	/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/,
	// https://drive.google.com/open?id=FOLDER_ID
	/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
];

export function parseDriveUrl(input: string): { folderId: string } | { error: string } {
	const trimmed = input.trim();
	if (!trimmed) {
		return { error: 'Please enter a Google Drive folder URL' };
	}

	// Try URL patterns first
	for (const pattern of PATTERNS) {
		const match = trimmed.match(pattern);
		if (match) {
			return { folderId: match[1] };
		}
	}

	// Maybe it's a raw folder ID
	if (FOLDER_ID_RE.test(trimmed) && trimmed.length >= 10) {
		return { folderId: trimmed };
	}

	return { error: 'Not a valid Google Drive folder URL' };
}
