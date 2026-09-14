import { NextResponse } from 'next/server';

export async function POST(req) {
  const { folder_id } = await req.json();
  if (!folder_id) {
    return NextResponse.json({ error: 'folder_id required' }, { status: 400 });
  }

  const API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const allItems = [];
    let pageToken;

    do {
      const params = new URLSearchParams({
        q: `'${folder_id}' in parents and trashed=false`,
        fields: 'nextPageToken,files(id,name,mimeType)',
        pageSize: '1000',
        key: API_KEY,
        ...(pageToken ? { pageToken } : {}),
      });

      const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      allItems.push(...(data.files || []));
      pageToken = data.nextPageToken;
    } while (pageToken);

    const files = allItems
      .map((f) => {
        const isVideo = f.mimeType?.startsWith('video/');
        const isImage = f.mimeType?.startsWith('image/');
        if (!isVideo && !isImage) return null;
        return {
          id: f.id,
          name: f.name,
          type: isVideo ? 'video' : 'photo',
          thumbnail: `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
          src: `https://drive.google.com/uc?id=${f.id}&export=download`,
          driveLink: `https://drive.google.com/file/d/${f.id}/view`,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ files, total: files.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
