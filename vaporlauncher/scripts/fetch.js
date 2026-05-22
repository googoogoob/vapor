async function dumpGames() {
  try {
    const response = await fetch('games.json');
    const data = await response.json();
    console.log(data.games);
  } catch (error) {
    console.error('Error loading games:', error);
  }
}

dumpGames();