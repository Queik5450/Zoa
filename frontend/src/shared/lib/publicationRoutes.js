export function getPublicationDetailPath(publicationId, mediaType = 'photo') {
  const safeId = publicationId ? encodeURIComponent(publicationId) : '';
  if (mediaType === 'audio') {
    return `/publicacion-audio?id=${safeId}`;
  }
  return `/publicacion?id=${safeId}`;
}

export function getDraftPublicationPath(mediaType = 'photo') {
  if (mediaType === 'audio') {
    return '/publicacion-audio?draft=1';
  }
  return '/publicacion?draft=1';
}
