// Countries to be used
const countryTargets = [
  'Germany',
  'Italy',
  'England',
  'France',
  'Spain',
  'Portugal',
  'Netherlands',
];
// API configuration object. API is public but requires key
const apiConfigObj = {
  method: 'GET',
  headers: {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': '4a5247197d2563f66ada59ac73f04b7f',
  },
};
runApp();

function runApp() {
  // Render list of countries and their flags
  const countriesList = document.querySelector('#list-countries');
  fetch(`https://v3.football.api-sports.io/countries`, apiConfigObj)
      .then((response) => response.json())
      .then((country) => {
        let countriesListBody = '';
        country.response.forEach((country) => {
          for (let i = 0; i < countryTargets.length; i++) {
            if (countryTargets[i] === country.name) {
              countriesListBody += `
            <button class= "country btn btn-info">
              <img src=${country.flag} class = "rounded-circle">
              <span class="country-name">${countryTargets[i]}</span>
            </button>
            `;
            }
          }
          countriesList.innerHTML = countriesListBody;
        });
        /* Add event listener to the countries to get
        highlighted and render the required information */
        const countries = document.getElementsByClassName('country');
        for (const country of countries) {
          country.addEventListener('click', function(e) {
            for (const country of countries) {
              country.className = 'country btn btn-info';
            }
            country.className += ' highlighted';
            removeCoachAndVenue();
            spinnerDisplayer('on', 'hidden', '#coach');
            spinnerDisplayer('on', 'hidden', '#venue');
            // Delete all elements from content div except the dropdown
            const mainContent = document.querySelector('.content');
            let mainContentChildrenAmount = mainContent.children.length - 1;
            while (mainContentChildrenAmount > 1) {
              mainContent.children[mainContentChildrenAmount].remove();
              mainContentChildrenAmount--;
            }
            // Show season dropdown
            const seasonsDropdownLabel = document.querySelector('label');
            const seasonsDropdown = document.querySelector('#season');
            seasonsDropdownLabel.style.display = 'inline';
            seasonsDropdown.style.display = 'inline';
            fetch(`https://v3.football.api-sports.io/leagues?country=${country.children[1].innerText}`,apiConfigObj)
                .then((resp) => resp.json())
                .then((leagues) => {
                  // Season dropdown options
                  seasonsDropdown.innerHTML = '';
                  leagues.response[0].seasons.reverse().forEach((season) => {
                    const seasonYear = document.createElement('option');
                    if (season.year !== 2022) {
                      seasonsDropdown.appendChild(seasonYear)
                          .textContent = season.year;
                    }
                  });
                  // Render name and logo of first division league
                  renderNameAndLogoLeague(leagues);
                  // Render the last champion team logo and StandingsTable
                  fetchRenderChampionStandingsStatsCoachAndVenue(leagues);
                  // Give functionality to the lookup feature
                  addEventListenerToPlayerInfo();
                });
            // Enable player lookup form
            document.querySelector('#player-name').disabled = false;
            document.querySelector('#player button').disabled = false;
          });
        }
        // Fetch and Render logo of the champion team
        fetchRenderChampionLogo();
      });
  // Show and run DidYouKnowFacts
  showDidYouKnowFacts();
  playShowDidYouKnowFacts();
}
function renderNameAndLogoLeague(leagues) {
  removeElementifExists('#league-and-champion');
  document
      .querySelector('.content')
      .appendChild(document.createElement('div'))
      .setAttribute('id', 'league-and-champion');
  const leagueAndChampLogosContainer = document.querySelector('#league-and-champion')
  leagueAndChampLogosContainer.innerHTML =
  `<div id="league">
      <h3 id=${leagues.response[0].league.id}>
        ${leagues.response[0].league.name}
      </h3>
      <img src=${leagues.response[0].league.logo} class = "rounded">
      </div>
      <div id="champion">
    </div>`;
}
function fetchRenderChampionStandingsStatsCoachAndVenue(leagues) {
  const leagueId = leagues.response[0].league.id;
  const season = document.querySelector('select');
  const championLogo = document.querySelector('#champion')
  fetch(
      `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`,
      apiConfigObj,
  )
      .then((resp) => resp.json())
      .then((standings) => {
        championLogo.innerHTML = 
        `<h3>1st Place</h3>
        <img src=${standings.response[0].league.standings[0][0].team.logo}>`;
        // Render Table & Standings last season
        fetchRenderStandingsStatsCoachAndVenue();
      })
      .catch(contentCatchError);
}
function fetchRenderStandingsStatsCoachAndVenue() {
  /* Renders the standings table, the league
    interesting stats, coach and venue */

  // Verify there is no table prior appending it
  removeElementifExists('#standings');
  removeElementifExists('#standings-qualifications');
  // Creation of the table headers
  document
      .querySelector('.content')
      .appendChild(document.createElement('table'))
      .setAttribute('id', 'standings');
  document.querySelector('#standings').className =
    'table table-striped table-hover .table-condensed table-responsive';
  document
      .querySelector('#standings')
      .appendChild(document.createElement('thead')).className = 'table-head';
  document.querySelector('#standings thead').innerHTML = `<tr>
        <th>Pos</th>
        <th class = "logos-header"> </th>
        <th>Team</th>
        <th>P</th>
        <th>W</th>
        <th>D</th>
        <th>L</th>
        <th>GF</th>
        <th>GA</th>
        <th>+/-</th>
        <th>PTS</th>
        <th>Last 5</th
      </tr>`;

  // Creation of the table body
  document
      .querySelector('#standings')
      .appendChild(document.createElement('tbody'));

  const leagueId = document.querySelector(
      '#league-and-champion h3:first-of-type',
  ).id;
  const standingsData = document.querySelector('#standings tbody');
  const season = document.querySelector('select');
  // Fetching to get the standings
  fetch(
      `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`,
      apiConfigObj,
  )
      .then((resp) => resp.json())
      .then((standings) => {
        let standingsDataBody = '';
        for (
          let i = 0;
          i < standings.response[0].league.standings[0].length;
          i++
        ) {
          standingsDataBody += `<tr>
          <td id = "rank">
          ${standings.response[0].league.standings[0][i].rank}</td>
          <td><img src = 
          ${standings.response[0].league.standings[0][i].team.logo}></td>
          <td id = "team-${standings.response[0].league.standings[0][i].team.id}" class = "team-name"><b>
          ${standings.response[0].league.standings[0][i].team.name}</b></td>
          <td>${standings.response[0].league.standings[0][i].all.played}</td>
          <td>${standings.response[0].league.standings[0][i].all.win}</td>
          <td>${standings.response[0].league.standings[0][i].all.draw}</td>
          <td>${standings.response[0].league.standings[0][i].all.lose}</td>
          <td>${standings.response[0].league.standings[0][i].all.goals.for}</td>
          <td>${standings.response[0].league.standings[0][i].all.goals.against}</td>
          <td>${standings.response[0].league.standings[0][i].goalsDiff}</td>
          <td><b>${standings.response[0].league.standings[0][i].points}</b></td>
          <td>
            ${
              last5Results(standings.response[0].league.standings[0][i].form)[0] === undefined ?
                '' :
                last5Results(standings.response[0].league.standings[0][i].form)[0]
            }
            ${
              last5Results(standings.response[0].league.standings[0][i].form)[1] === undefined ?
                '' :
                last5Results(standings.response[0].league.standings[0][i].form)[1]
            }
            ${
              last5Results(standings.response[0].league.standings[0][i].form)[2] === undefined ?
                '' :
                last5Results(standings.response[0].league.standings[0][i].form)[2]
            }
            ${last5Results(standings.response[0].league.standings[0][i].form)[3] === undefined ?
                '' :
                last5Results(standings.response[0].league.standings[0][i].form)[3]
            }
            ${
              last5Results(standings.response[0].league.standings[0][i].form)[4] === undefined ?
                '' :
                last5Results(standings.response[0].league.standings[0][i].form)[4]
            }
          </td>
        </tr>`;
        }
        standingsData.innerHTML = standingsDataBody;
        for (let i = 0; i < standings.response[0].league.standings[0].length; i++) {
          if (typeof standings.response[0].league.standings[0][i].description ==='string') {
            if (!!standings.response[0].league.standings[0][i].description.match('Champions League')) {
              document.querySelectorAll('tr #rank')[i].style.background = 'green';
            }
            if (!!standings.response[0].league.standings[0][i].description.match('Europa League')) {
              document.querySelectorAll('tr #rank')[i].style.background ='orange';
            }
            if (!!standings.response[0].league.standings[0][i].description.match('Relegation')) {
              document.querySelectorAll('tr #rank')[i].style.background = 'red';
            }
          }
        }
        // Add table footer tags
        document.querySelector('#standings').insertAdjacentHTML('afterend',
            `<ul id= 'standings-qualifications'>
              <li id= "champions-league"> Qualify or play-offs to Champions League</li>
              <li id= "europa-league">Qualify or play-offs to Europa League</li>
              <li id= "relegation">Relegation or play-offs to stay in 1st division</li>
            </ul>`);
        fetchRenderTopScorersAndInterestingStats();
        fetchRenderCoachVenue();
      })
      .catch(() => alert('Not yet available information'));
}
function fetchRenderTopScorersAndInterestingStats() {
  // Verify there is no tables prior appending it
  removeElementifExists('#facts-container');
  document
      .querySelector('.content')
      .appendChild(document.createElement('div'))
      .setAttribute('id', 'facts-container');
  // Creation of the table headers
  document
      .querySelector('#facts-container')
      .appendChild(document.createElement('table'))
      .setAttribute('id', 'top-scorers');
  document.querySelector('#top-scorers').className =
    'table table-striped table-hover .table-condensed';
  document
      .querySelector('#top-scorers')
      .appendChild(document.createElement('thead')).className = 'table-head';
  document.querySelector('#top-scorers thead').innerHTML = `<tr>
      <th class = "logos-header"> </th>
      <th>Top 15 Scorers</th>
      <th>Goals</th>
    </tr>`;
  // Creation of the table body
  document
      .querySelector('#top-scorers')
      .appendChild(document.createElement('tbody'));
  const leagueId = document.querySelector(
      '#league-and-champion h3:first-of-type',
  ).id;
  const season = document.querySelector('select');
  const topScorersData = document.querySelector('#top-scorers tbody');
  // Fetching to get the standings
  fetch(`https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${season.value}`,apiConfigObj,)
      .then((resp) => resp.json())
      .then((topScorers) => {
        let topScorersDataBody = '';
        for (let i = 0; i < 15; i++) {
          topScorersDataBody += `<tr>
          <td><img src = ${topScorers.response[i].statistics[0].team.logo}></td>
          <td>${topScorers.response[i].player.name}</td>
          <td>${topScorers.response[i].statistics[0].goals.total}</td>
        </tr>`;
        }
        topScorersData.innerHTML = topScorersDataBody;
      });
  document
      .querySelector('#facts-container')
      .appendChild(document.createElement('div'))
      .setAttribute('id', 'more-facts');
  // Render League facts. Needs mock server.
  fetchRenderLeagueFactsJsJSON('largest_streak_wins', 'max');
  fetchRenderLeagueFactsJsJSON('largest_streak_draws', 'max');
  fetchRenderLeagueFactsJsJSON('largest_streak_loses', 'max');
  fetchRenderLeagueFactsJsJSON('penalty', 'max');
  fetchRenderLeagueFactsJsJSON('penalty', 'min');
  fetchRenderLeagueFactsJsJSON('clean_sheet', 'max');
}
function fetchRenderChampionLogo() {
  // Fetch and Render champion team logo
  const season = document.querySelector('select');
  season.addEventListener('change', () => {
    removeCoachAndVenue();
    spinnerDisplayer('on', 'hidden', '#coach');
    spinnerDisplayer('on', 'hidden', '#venue');
    removeElementifExists('#champion img');
    const leagueId = document.querySelector('#league-and-champion h3:first-of-type').id;
    const championTeam = document.querySelector('#champion')
    fetch(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`,apiConfigObj)
        .then((resp) => resp.json())
        .then((standings) => {
          championTeam.innerHTML = 
          `<h3>1st Place</h3>
          <img src=${standings.response[0].league.standings[0][0].team.logo}>`;
          // Render Table & Standings
          fetchRenderStandingsStatsCoachAndVenue();
        })
        .catch(contentCatchError);
  });
}
function fetchRenderLeagueFactsJsJSON(streakType, type) {
  /* streakType options:
    -largest_streak_wins
    -largest_streak_draws
    -largest_streak_loses
    -penalty
    -clean_sheet
    type options:
    -max, else min */
  const leagueId = document.querySelector(
      '#league-and-champion h3:first-of-type',
  ).id;
  const leagueFacts = {};
  const teamNames = [];
  const streakTeams = [];
  if (document.querySelector('select').value === '2020') {
    for (const team in teamStats[leagueId]) {
      const factsList = {
        largest_streak_wins: teamStats[leagueId][team].biggest.streak.wins,
        largest_streak_draws: teamStats[leagueId][team].biggest.streak.draws,
        largest_streak_loses: teamStats[leagueId][team].biggest.streak.loses,
        best_win_home: teamStats[leagueId][team].biggest.wins.home,
        best_win_away: teamStats[leagueId][team].biggest.wins.away,
        worst_lose_home: teamStats[leagueId][team].biggest.loses.home,
        worst_lose_away: teamStats[leagueId][team].biggest.loses.away,
        clean_sheet: teamStats[leagueId][team].clean_sheet.total,
        penalty: teamStats[leagueId][team].penalty.total,
      };
      teamNames.push(team);
      leagueFacts[team] = factsList;
    }
    const streaks = teamNames.map((team) => leagueFacts[team][streakType]);
    const biggestStreak = type === 'max' ? Math.max(...streaks) : Math.min(...streaks);
    for (const teamName of teamNames) {
      if (leagueFacts[teamName][streakType] === biggestStreak) {
        streakTeams.push(teamName);
      }
    }
    if (streakType === 'largest_streak_wins' && type === 'max') {
      renderStreakTeams('Largest Win Streak', biggestStreak, streakTeams);
    }
    if (streakType === 'largest_streak_draws' && type === 'max') {
      renderStreakTeams('Largest Draw Streak', biggestStreak, streakTeams);
    }
    if (streakType === 'largest_streak_loses' && type === 'max') {
      renderStreakTeams('Largest Lose Streak', biggestStreak, streakTeams);
    }
    if (streakType === 'penalty' && type === 'max') {
      renderStreakTeams('Most Penalties Conceded', biggestStreak, streakTeams);
    }
    if (streakType === 'penalty' && type === 'min') {
      renderStreakTeams('Fewest Penalties Conceded', biggestStreak, streakTeams);
    }
    if (streakType === 'clean_sheet' && type === 'max') {
      renderStreakTeams('Most Clean Sheets', biggestStreak, streakTeams);
    }
  }
}
function renderStreakTeams(tableHeader, biggestStreak, streakTeams) {
  const interestingStats = document.querySelector('#more-facts');
  interestingStats.appendChild(document.createElement('div')).innerHTML = 
  `<table class = "facts-info table table-bordered table-hover .table-condensed">
      <tr>
        <th colspan='2' class = "facts-header">${tableHeader}</th>
      </tr>
      <tr>
        <td class="biggest-streak"><strong>${biggestStreak}</strong></td>
        <td class="streak-team"></td>
      </tr>
    </table>`;
  streakTeams.forEach((team) => {
    const biggestStreaks = document.querySelectorAll('.biggest-streak');
    const streakTeams = document.querySelectorAll('.streak-team');
    biggestStreaks[biggestStreaks.length - 1].setAttribute('rowspan',`${streakTeams.length}`);
    streakTeams[streakTeams.length - 1].appendChild(document.createElement('tr')).innerHTML = `<li>${team}</li>`;
  });
}
function fetchRenderCoachVenue() {
  const coachSection = document.querySelector('#coach')
  const venueSection = document.querySelector('#venue')
  const standingsTableRows = document.querySelectorAll('#standings tbody tr')
  standingsTableRows.forEach((team) => {
    team.addEventListener('click', () => {
      removeCoachAndVenue();
      // Prevent element to be event listened while fetching
      team.style.pointerEvents = 'none';
      // Display loading spinner
      spinnerDisplayer('on', 'visible', '#coach');
      // Fetch coach
      fetch(`https://v3.football.api-sports.io/coachs?team=${team.children[2].id.split('-')[1]}`,apiConfigObj)
          .then((resp) => resp.json())
          .then((coaches) => {
            coachSection.appendChild(document.createElement('img')).setAttribute('src', `${coaches.response[0].photo}`);
            document.querySelector('#coach img').className = 'rounded-circle';
            coachSection.appendChild(document.createElement('p')).textContent = `${coaches.response[0].name}`;
            // Allow element to be event listened after fetiching
            team.style.pointerEvents = 'auto';
            // Don't display loading spinner
            spinnerDisplayer('off', 'hidden', '#coach');
          });
      removeCoachAndVenue();
      // Display loading spinner
      spinnerDisplayer('on', 'visible', '#venue');
      // Fetch team venue
      fetch(`https://v3.football.api-sports.io/teams?id=${team.children[2].id.split('-')[1]}`,apiConfigObj)
          .then((resp) => resp.json())
          .then((teamInfo) => {
            document.querySelector('#venue h2').textContent = 'Venue:';
            document.querySelector('#venue h2').textContent +=' ' + team.children[2].textContent;
            venueSection.appendChild(document.createElement('img')).setAttribute('src', `${teamInfo.response[0].venue.image}`);
            document.querySelector('#venue img').className = 'rounded';
            venueSection.appendChild(document.createElement('p')).textContent = `${teamInfo.response[0].venue.name}`;
            team.style.pointerEvents = 'auto'; // Allows element to be event listened after fetiching
            // Don't display loading spinner
            spinnerDisplayer('off', 'hidden', '#venue');
          });
    });
  });
}
function addEventListenerToPlayerInfo() {
  /* Renders soccer players information */
  const leagueId = document.querySelector(
      '#league-and-champion h3:first-of-type',
  ).id;
  const playerName = document.querySelector('#player-name');
  const submitPlayer = document.querySelector('#player form');
  submitPlayer.addEventListener('submit', (e) => {
    e.preventDefault();
    if (playerName.value.length < 4) {
      alert('I need at least 4 characters. Try again :)');
    } else {
      removeElementifExists('#player-img');
      fetch(`https://v3.football.api-sports.io/players?search=${playerName.value}&league=${leagueId}`,apiConfigObj,)
          .then((resp) => resp.json())
          .then((players) => {
            document
                .querySelector('#player')
                .appendChild(document.createElement('div'))
                .setAttribute('id', 'player-img');
            document.querySelector(
                '#player-img',
            ).innerHTML = `<img src="https://media.api-sports.io/football/players/${players.response[0].player.id}.png">
          <ul>
          <li>First Name: <b>${players.response[0].player.firstname}</b></li>
          <li>Surname: <b>${players.response[0].player.lastname}</b></li>
          <li>Age: <b>${players.response[0].player.age}</b></li>
          </ul>
          <p>This player was born in ${players.response[0].player.birth.place}, ${players.response[0].player.birth.country}, and plays for ${players.response[0].statistics[0].team.name} as ${players.response[0].statistics[0].games.position}.`;
            playerName.value = '';
          })
          .catch(()=>{
            playerName.value = ''
          });
    }
  });
}
function showDidYouKnowFacts() {
  // Render random Did you know facts
  const didYouKnowFacts = [
    'The earliest game that resembled association football in history is the Chinese game cuju. The history of the sport dates back to the Han Dynasty (206 BC – 220 AD).',
    'Early alternatives to association football balls include animal skins, skulls, pig bladders, and more.',
    'The oldest professional football club in the world still in existence today is Sheffield FC. It was founded in 1857, and they have fluctuated in different tiers of play in England.',
    'The country of Greenland has never been able to have a FIFA recognized team. That is because they can’t grow grass to create fields.',
    'Referees were not used in official soccer matches until 1881. Up until then, people playing were responsible for making any calls.',
    'The popularity of association football took off with colonialism, as the British took the game with them to all corners of the world.',
    'The very first World Cup was a difficult tournament for European countries to get to in 1930. Hosted in Uruguay, only France, Romania, Belgium, and Yugoslavia were able to make the trip from Europe.',
    'A match in the Congo in 1998 ended in tragedy as lightning killed an entire team. The opposition was left untouched.',
    'Football made its television debut in 1937, featuring Arsenal in England. It was a practice match that involved players from the club.',
    'The most fans to attend one football match took place in 1950 in Rio de Janeiro. A total of 199,854 people watch Brazil play Uruguay in the World Cup.',
    'There are over 5000 teams in the English football system, with different tiers depending on the caliber of play. Any team can move up to the highest league, the Barclays Premier League, by winning and moving up.',
    'Cristiano Ronaldo holds the distinction as the only known football player in professional history to score a goal in every single minute of a match.',
  ];
  const rgbas = [
    'rgba(165, 94, 36, 0.5)',
    'rgba(241, 47, 33, 0.5)',
    'rgba(241, 186, 33, 0.5)',
    'rgba(151, 241, 33, 0.5)',
    'rgba(33, 241, 161, 0.3)',
    'rgba(24, 174, 243, 0.2)',
    'rgba(243, 24, 108, 0.2)',
  ];
  const randomInteger = () => Math.floor(Math.random() * didYouKnowFacts.length);
  const randomRGBA = () => Math.floor(Math.random() * rgbas.length);
  const randomFacts = document.getElementById('random-facts')
  randomFacts.innerHTML = 
  `<p><b>Did you know that...</b></p>
  <small>${didYouKnowFacts[randomInteger()]}</small>`
  randomFacts.style.backgroundColor =rgbas[randomRGBA()];
}
function playShowDidYouKnowFacts() {
  let intervalStarter = setInterval(showDidYouKnowFacts, 10000);
  intervalStarter
  const randomFactsButton = document.querySelector('#pause-play-did-you-know-facts')
  randomFactsButton.addEventListener('click', (e)=> {
    if (randomFactsButton.className === 'btn btn-warning') {
      randomFactsButton.className = 'btn btn-success'
      randomFactsButton.textContent = 'Play'
      clearInterval(intervalStarter)
    } else if (randomFactsButton.className === 'btn btn-success') {
      randomFactsButton.className = 'btn btn-warning'
      randomFactsButton.textContent = 'Pause'
      intervalStarter = setInterval(showDidYouKnowFacts, 10000);
      intervalStarter
    }
  })
}
function removeCoachAndVenue() {
  // Removes all the data from the right sidebar
  document.querySelector('#venue h2').textContent = 'Venue:';
  // Remove country and team text requests if exist
  removeElementifExists('#coach p');
  // Verify there is no images or names prior appending them
  removeElementifExists('#coach img');
  // Remove country and team text requests if exist
  removeElementifExists('#venue p');
  // Verify there is no images or names prior appending them
  removeElementifExists('#venue img');
}
function last5Results(results) {
  // Returns image link related to the result of the match
  return results.split('').map((char) => {
    switch (char) {
      case 'W':
        char = '<img src="src/img/win.svg">';
        break;
      case 'D':
        char = '<img src="src/img/draw.svg">';
        break;
      case 'L':
        char = '<img src="src/img/lose.svg">';
    }
    return char;
  });
}
function spinnerDisplayer(mode, visibility, parentSelector) {
  // Displays or hides a loading spinner
  if (mode === 'on') {
    document.querySelector(`${parentSelector} .spinner-border`).style.display ='block';
    document.querySelector(`${parentSelector} .spinner-border`).style.visibility = `${visibility}`;
  } else if (mode === 'off') {
    document.querySelector(`${parentSelector} .spinner-border`).style.visibility = `${visibility}`;
    document.querySelector(`${parentSelector} .spinner-border`).style.display ='none';
  }
}
function contentCatchError() {
  /* Removes required information that client must
  not see in case there isn't data to fetch */
  removeElementifExists('#standings');
  removeElementifExists('#standings-qualifications');

  if (!!document.querySelector('#champion')) {
    document.querySelector('#champion').innerHTML = '';
  }
  alert('COMING SOON!!!');
}
function removeElementifExists(selector) {
  if (!!document.querySelector(selector)) {
    document.querySelector(selector).remove();
  }
}
