export const YouTubeEmbed = ({ id, showControls }) => {
  let source = `https://www.youtube.com/embed/${id}`;

  if (!showControls) {
    source += `?controls=0`;
  }

  return <iframe
    className="w-full aspect-video"
    src={source}
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  ></iframe>
};
