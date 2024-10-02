import React from 'react';

export const GitHubStarButton = ({ username, repo }) => {
  return (
    <a href={`https://github.com/${username}/${repo}`} target="_blank" rel="noopener noreferrer">
      <img 
        alt="GitHub stars" 
        src={`https://img.shields.io/github/stars/${username}/${repo}?style=social`}
      />
    </a>
  );
};