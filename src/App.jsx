import { useState, useEffect } from "react";

// ===== TMDB settings =====
const API_KEY = "004036cbf4df938623cbca6b8816213e";
const BASE_URL = "https://api.themoviedb.org/3";
const MAX_API_PAGE = 500;
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

// ===== Header — Page header =====
function Header() {
  return (
    <header>
      <h1>Movie Explorer</h1>
    </header>
  );
}

// ===== Controls — Search bar and sort dropdown =====
function Controls({ sortChoice, onSearch, onSort }) {
  return (
    <div className="controls">
      <input
        type="text"
        placeholder="Search for a movie..."
        onChange={(e) => onSearch(e.target.value)}
      />
      <select value={sortChoice} onChange={(e) => onSort(e.target.value)}>
        <option value="default">Sort By</option>
        <option value="date-asc">Release Date (Asc)</option>
        <option value="date-desc">Release Date (Desc)</option>
        <option value="rating-asc">Rating (Asc)</option>
        <option value="rating-desc">Rating (Desc)</option>
      </select>
    </div>
  );
}

// ===== MovieCard — One movie: poster, title, release date, rating =====
function MovieCard({ movie }) {
  return (
    <div className="movie-card">
      <img src={`${IMAGE_URL}${movie.poster_path}`} alt={movie.title} />
      <h2>{movie.title}</h2>
      <p>Release Date: {movie.release_date}</p>
      <p>Rating: {movie.vote_average}</p>
    </div>
  );
}

// ===== MovieList — Grid of movie cards =====
function MovieList({ movies }) {
  return (
    <div className="movie-container">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

// ===== Pagination — Previous / Next buttons and page number =====
function Pagination({ currentPage, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination">
      <button onClick={onPrev}>Previous</button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={onNext}>Next</button>
    </div>
  );
}

// ===== Sort a copy of the current page's movies =====
function sortMovies(movies, choice) {
  const sorted = movies.slice();

  if (choice === "date-asc") {
    sorted.sort((a, b) =>
      (a.release_date || "").localeCompare(b.release_date || ""),
    );
  } else if (choice === "date-desc") {
    sorted.sort((a, b) =>
      (b.release_date || "").localeCompare(a.release_date || ""),
    );
  } else if (choice === "rating-asc") {
    sorted.sort((a, b) => a.vote_average - b.vote_average);
  } else if (choice === "rating-desc") {
    sorted.sort((a, b) => b.vote_average - a.vote_average);
  }

  return sorted;
}

function App() {
  // ===== State =====
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortChoice, setSortChoice] = useState("default");

  // ===== Fetch movies whenever the page or search changes =====
  useEffect(() => {
    let ignore = false; // set to true if a newer request starts first

    let url;
    if (searchQuery === "") {
      url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${currentPage}`;
    } else {
      url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${currentPage}`;
    }

    async function fetchMovies() {
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (ignore) return;
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchMovies();

    // Cleanup: skip the result of this request if a newer one replaced it
    return () => {
      ignore = true;
    };
  }, [currentPage, searchQuery]);

  // ===== Event handlers (passed down as props) =====

  // Search updates as the user types; clearing the box goes back to popular movies
  function handleSearch(text) {
    setSearchQuery(text.trim());
    setCurrentPage(1);
  }

  // Sorting only re-orders the movies already on the page (no new request)
  function handleSort(choice) {
    setSortChoice(choice);
  }

  function handlePrev() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function handleNext() {
    if (currentPage < totalPages && currentPage < MAX_API_PAGE) {
      setCurrentPage(currentPage + 1);
    }
  }

  return (
    <>
      <Header />
      <Controls
        sortChoice={sortChoice}
        onSearch={handleSearch}
        onSort={handleSort}
      />
      <MovieList movies={sortMovies(movies, sortChoice)} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  );
}

export default App;
