import puppeteer from 'puppeteer';
import ical from 'ical-generator';
import fs from 'fs';

// Funktion til at konvertere datoformatet
const convertDateFormat = (originalDate) => {
  const [dayMonth, year] = originalDate.split('-');
  const [day, month] = dayMonth.split('/');
  return `${month}-${day}-${year}`;
};

// Funktion til at få ISO-uge
const getISOWeek = (date) => {
  const dt = new Date(date);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + 3 - ((dt.getDay() + 6) % 7));
  const week1 = new Date(dt.getFullYear(), 0, 4);
  return 1 + Math.round(((dt - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

// Funktion til at skrabe skemaet
const scrapeSchedule = async (school, username, password, targetWeek = null, weekCount) => {
  // Start en ny browser session med Puppeteer
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/google-chrome-stable',
    defaultViewport: null,
  });
  const page = await browser.newPage(); // Åbn en ny fane

  try {
    // Gå til login-siden for Lectio
    await page.goto(`https://www.lectio.dk/lectio/${school}/login.aspx`, {
      waitUntil: 'networkidle0',
    });

    // Udfyld brugernavn og adgangskode og log ind
    await page.type('#username', username);
    await page.type('#password', password);
    await page.click('#m_Content_submitbtn2');

    let currentWeek;
    if (targetWeek) {
      currentWeek = targetWeek.toString().padStart(2, '0');
    } else {
      currentWeek = getISOWeek(new Date()).toString().padStart(2, '0');
    }
    console.log(currentWeek)

    for (let lp = 0; lp < weekCount; lp++) {
      const currentYear = new Date().getFullYear();

      // Gå til skemasiden for den aktuelle uge
      await page.goto(`https://www.lectio.dk/lectio/${school}/SkemaNy.aspx?&week=${currentWeek}${currentYear}`, {
        waitUntil: 'domcontentloaded',
      });

      const events = [];

      // Find alle skemabrik-containerne på siden
      const containers = await page.$$('.s2skemabrikcontainer.lec-context-menu-instance');
      for (const container of containers) {
        // Find alle links inde i containeren
        const links = await container.$$('a:not(li a)');
        console.log(links.length)
        for (const link of links) {
          // Hent tooltip-data fra hvert link
          const tooltipData = await link.evaluate(node => node.getAttribute('data-tooltip'));

          console.log(tooltipData)
          if (tooltipData) {
            // Check om begivenheden er aflyst
            if (tooltipData.toLowerCase().includes('aflyst')) {
              console.log('Begivenheden er aflyst. Springer over...');
              continue;  // Spring over begivenheden
            }
            // Find dato, starttid og sluttid fra tooltip-data
            const dateMatch = tooltipData.match(/(\d{1,2}\/\d{1,2}-\d{4}) (\d{1,2}:\d{2}) til (\d{1,2}:\d{2})/);
            if (!dateMatch) continue;

            const date = convertDateFormat(dateMatch[1]);
            const startTime = dateMatch[2];
            const endTime = dateMatch[3];

            // Find titel, yderligere info og beskrivelse fra tooltip-data
            const titleParts = tooltipData.split('\n').slice(2, 5);
            const additionalInfo = titleParts.slice(0, titleParts.length - 1).join(' ');
            const title = titleParts[titleParts.length - 1];

            const description = tooltipData.split('\n').slice(5).join('\n');

            // Opret start- og sluttidspunkter som JavaScript Date-objekter
            const startDateTime = new Date(`${date} ${startTime}`);
            const endDateTime = new Date(`${date} ${endTime}`);

            console.log(date)
            console.log(startDateTime)
            console.log(startTime)
            if (!isNaN(startDateTime) && !isNaN(endDateTime)) {
              // Tilføj begivenheden til listen af begivenheder
              const modifiedTitle = additionalInfo.length > 0 ? `${additionalInfo} - ${title}` : title;

              events.push({
                start: startDateTime,
                end: endDateTime,
                summary: modifiedTitle,
                description: description,
              });
            }
          }
        }
      }

      // Opret en kalender med begivenhederne
      const cal = ical({});
      events.forEach(event => cal.createEvent(event));

      // Konverter kalenderen til en streng i iCalendar-format
      const icsData = cal.toString();

      console.log("ICS-filindhold:");
      console.log(icsData);

      // Gem kun hvis der er begivenheder
      if (!events.length == 0) {
        fs.writeFileSync(`calendars/ical_week${currentWeek}_${currentYear}.ics`, icsData);
        console.log(`ICS-fil gemt som calendars/ical_week${currentWeek}_${currentYear}.ics`);
        console.log(currentWeek)
      }

      // Gå videre til næste uge
      currentWeek++;
      currentWeek = currentWeek.toString().padStart(2, '0');
    }
  } catch (error) {
    console.error('Der opstod en fejl:', error);
  } finally {
    // Luk browseren efter skrabningen er færdig
    await browser.close();
  }
};

// Funktion til at køre skrabningen
function runScrape() {
  const Uschool = 111;
  const Uusername = 'username';
  const Upassword = 'password';
  const targetWeek = null; // Angiv den ønskede uge her (brug null for nuværende uge, andet fungerer ikke)
  const weekCount = 10;

  scrapeSchedule(Uschool, Uusername, Upassword, targetWeek, weekCount);
}

// Kør den indledende skrabning ved opstart
runScrape();

// Planlæg skrabningen til at køre hver 10. minut (600.000 millisekunder)
setInterval(runScrape, 600000);
