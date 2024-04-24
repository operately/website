export const YouTubeEmbed = ({ id }) => (
  <iframe
    className="w-full aspect-video"
    src={`https://www.youtube.com/embed/${id}?controls=0`}
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  ></iframe>
);
