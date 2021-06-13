const countryTargets = [
  "Spain",
  "Germany",
  "Italy",
  "France",
  "England",
  "Netherlands",
  "Brazil",
];
const apiCongigObj = {
  method: "GET",
  headers: {
    "x-rapidapi-host": "v3.football.api-sports.io",
    "x-rapidapi-key": "8bc0ad048d98ed6fa090704ed786ca23",
  },
};
//Render list of countries and their flags
fetch(`https://v3.football.api-sports.io/countries`, apiCongigObj)
  .then((response) => response.json())
  .then((country) => {
    console.log(country.response.length);
    country.response.forEach((country) => {
      for (let i = 0; i < countryTargets.length; i++) {
        if (countryTargets[i] === country.name) {
          document
            .getElementById("list-countries")
            .appendChild(document.createElement("li")).className = "country";
          document
            .getElementsByClassName("country")
            [document.getElementsByClassName("country").length - 1].appendChild(
              document.createElement("span")
            ).className = "country-flag";
          document
            .getElementsByClassName("country-flag")
            [
              document.getElementsByClassName("country-flag").length - 1
            ].appendChild(document.createElement("img"))
            .setAttribute("src", country.flag);
          document
            .getElementsByClassName("country")
            [document.getElementsByClassName("country").length - 1].appendChild(
              document.createElement("span")
            ).className = "country-name";
          document.getElementsByClassName("country-name")[
            document.getElementsByClassName("country-name").length - 1
          ].textContent = countryTargets[i];
        }
      }
    });
  });

const countries = document.getElementsByClassName('country')
for (const country of countries) {
  country.addEventListener('click', function(e) {
    //Show season dropdown
    document.querySelector('label').style.display = 'inline'
    document.querySelector('select').style.display = 'inline'
    fetch(`https://v3.football.api-sports.io/leagues?country=${country.innerText}`,apiCongigObj)
      .then(resp => resp.json())
      .then(leagues => {
        console.log(leagues)
        //Season dropdown options (if later on I can't upload the table, check values!!)
        document.getElementById('season').innerHTML = ''
        leagues.response[0].seasons.forEach(season => document.getElementById('season').appendChild(document.createElement('option')).textContent = season.year)
        
        //Parse name and logo of first division league
        if (!!document.querySelectorAll('.content h3')[0]) {
          document.querySelectorAll('.content h3')[0].remove()
          document.querySelectorAll('.content img')[0].remove()
        }
        document.querySelector('.content').appendChild(document.createElement('h3')).textContent = leagues.response[0].league.name
        document.querySelector('.content').appendChild(document.createElement('img')).setAttribute('src', leagues.response[0].league.logo)
      })
  })
}
