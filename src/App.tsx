import React, { useState } from 'react';
import './App.css';
import { SearchBox } from './component/searchBox';
import axios, { AxiosError } from 'axios';

const API_KEY = process.env.REACT_APP_GIPHY_API_KEY;

export function App(): React.JSX.Element {
  const [result, setResult] = useState<any[]>([]);
  const [limit, setLimit] = useState<string>('5');
  const [total, setTotal] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [offset, setOffset] = useState<number>(0);
  const [rating, setRating] = useState<string>('g');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //handle has searched
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Trending suggestions
  const trendingSuggestions = [
    'technology', 'meme', 'reaction', 'dance', 'celebration', 'baseline', 'react', 'typescript', 'deploy', 'webpage', 's3', 'website', 'cdn', 'cloudfront', 'ssl', 'tls', 'https', 'bitbucket', 'github', 'cache', 'pipeline'
  ];

  /**
   * Handle the search for gifs
   * @param search - The search query
   * @returns void
   */
  const handleSearch = (search: string): void => {
    setResult([]);
    setTotal(0);
    setOffset(0);
    setQuery(search);
    setIsLoading(true);
    setHasSearched(true);

    axios({
      method: 'GET',
      url: `https://api.giphy.com/v1/gifs/search`,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        ['api_key']: API_KEY,
        ['q']: search,
        ['limit']: limit,
        ['offset']: 0,
        ['rating']: rating,
      },
    })
    .then((response) => {
      //console.log(response.data);
      const gifs = response.data?.data || [];
      setResult(gifs);
      const total = response.data?.pagination?.total_count;
      //console.log(total);
      setTotal(total);
      setOffset(gifs.length);
      })
    .catch((error: AxiosError) => {
      console.error(error);
      setResult([]);
      })
    .finally(() => {
      setIsLoading(false);
    });
    };

  /**
   * Load more gifs when scrolling to the bottom of the page
   * @param
   * @returns void
   */
  const loadMore = (): void => {
    if (isLoading) return;
    if (result.length >= total) return;
    setIsLoading(true);
    axios({
      method: 'GET',
      url: `https://api.giphy.com/v1/gifs/search`,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        ['api_key']: API_KEY,
        ['q']: query,
        ['limit']: limit,
        ['offset']: offset,
        ['rating']: rating,
      },
    })
    .then((response) => {
      const gifs = response.data?.data || [];
      setResult((prev) => [...prev, ...gifs]);
      setOffset((prev) => prev + gifs.length);
    })
    .catch((error: AxiosError) => {
      console.error(error);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  /**
   * Load more gifs when scrolling to the bottom of the page
   */
  React.useEffect(() => {
    const onScroll = (): void => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 300;
      if (scrollPosition >= threshold) {
        loadMore();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => window.removeEventListener('scroll', onScroll as any);
  }, [result.length, total, isLoading, offset, query, limit, rating]);

  /**
   * Copy the link of the gif
   * @param idx - The index of the gif
   * @returns void
   */
  const handleCopyLink = (gif: any): void => {
    navigator.clipboard.writeText(gif?.images?.original?.url || '');
  };

  /**
   * View the gif on Giphy
   * @param gif - The gif to view
   * @returns void
   */
  const handleViewOnGiphy = (gif: any): void => {
    if (gif?.url) {
      window.open(gif.url, '_blank');
    }
  };

  /**
   * Handle trending suggestion click
   * @param suggestion - The trending suggestion to search
   * @returns void
   */
  const handleTrendingSuggestion = (suggestion: string): void => {
    handleSearch(suggestion);
  };

  return (
    <div className="app">
      <div className="search-container">
        <h1>Giphy Search</h1>
        <p>Powered by <a href="https://giphy.com/" target="_blank" rel="noopener noreferrer"><img src="/GIPHY Logo 60px.png" alt="Giphy" /></a></p>

        <SearchBox onSearch={handleSearch} />

        <div className="search-container-filters">
        <div className="search-container-item">
          <span>Limit per Request</span>
          <select onChange={(e) => setLimit(e.target.value)} value={limit}>
            <option value="5" selected={limit === '5'}>5</option>
            <option value="10" selected={limit === '10'}>10</option>
            <option value="20" selected={limit === '20'}>20</option>
            <option value="50" selected={limit === '50'}>50</option>
            <option value="100" selected={limit === '100'}>100</option>
          </select>
        </div>
        <div className="search-container-item">
          <span>Rating</span>
        <select onChange={(e) => setRating(e.target.value)} value={rating}>
          <option value="g" selected={rating === 'g'}>G</option>
          <option value="pg" selected={rating === 'pg'}>PG</option>
          <option value="pg-13" selected={rating === 'pg-13'}>PG-13</option>
          <option value="r" selected={rating === 'r'}>R</option>
        </select>
        </div>
        <div className="search-container-item">
          <span>Trending Searches</span>
          <div className="trending-suggestions">
            {trendingSuggestions.slice(0, 12).map((suggestion, idx) => (
              <button 
                key={idx} 
                className="trending-btn"
                onClick={() => handleTrendingSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>    
        </div>
      </div>
      
      {hasSearched && (
        result.length > 0 ? (
          <div>
            <div className="showResult">
              {result.map((gif, idx) => (
                <div key={`${idx}-${gif?.id || idx}`} className="gif-container">
                  <img src={gif?.images?.original?.url} alt={gif?.title || 'Gif'} className="gif" />
                  <div className="gif-actions">
                    <button onClick={() => handleCopyLink(gif)}>Copy URL</button>
                    <button onClick={() => handleViewOnGiphy(gif)}>View on Giphy</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-result">
            {total === 0 && !isLoading && <div className="no-result">No result found</div>}
          </div>
        )
      )}

      {isLoading &&
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading GIFs…</div>
        </div>
      }

    </div>
  );
}

export default App;
