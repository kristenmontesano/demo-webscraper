import axios from 'axios';
import cheerio from 'cheerio';
import { URL } from 'url';

async function scrapeWebsite(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url);
      const selector = cheerio.load(data);
  
      // Remove script and style elements along with their content
      selector('script, style').remove();
  
      // Extract and log only the plaintext from the body of the website
      const plainText = selector('body').text().replace(/\s+/g, ' ').trim();
  
      return plainText;
    } catch (error: any) {
      console.error(`Error scraping ${url}: `, error.message);
      return '';
    }
}

async function scrapeWikipediaPage(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url);
    const selector = cheerio.load(data);

    return JSON.stringify({
        'title': selector('h1').first().text(),
        'summary': selector('p').first().text(),
        'infoBox': selector('.infobox').text(),
        'categories': selector('#mw-normal-catlinks ul li').map((i, el) => selector(el).text()).get(),
    });
  } catch (error: any) {
    console.error(`Error scraping ${url}: `, error.message);
    return '';
  }
}

function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

const urls = [
    "https://en.wikipedia.org/wiki/Web_scraping",
    "https://www.google.com",
    "https://www.wikipedia.org",
    "https://en.wikipedia.org/wiki/Chihuahua_(dog_breed)"
]

async function main() {
  const args = process.argv.slice(2);
  let urlsToScrape = [];
  if (args.length < 1) {
    console.log("Please provide a search string, followed optionally by at least one URL.");
    return;
  }
  const searchString = args[0];

  if (args.length === 1) {
    urlsToScrape = urls;
  } else {
    urlsToScrape.push(args[0]);
  }

  for (const url of urlsToScrape) {
    if (!isValidUrl(url)) {
      console.log("One of the provided arguments is not a valid URL:", url);
      continue;
    }

    let scrapedData = '';
    if (url.includes('wikipedia.org')) {
      scrapedData = await scrapeWikipediaPage(url);
    } else {
      scrapedData = await scrapeWebsite(url);
    }

    const count = (scrapedData.match(new RegExp(searchString, "gi")) || []).length;

    if (count > 0) {
      console.log(`Found ${count} instances of "${searchString}" on ${url}`);
    } else {
      console.log(`No instances of "${searchString}" found on ${url}`);
    }
  }
}

main();