import axios from 'axios';
import cheerio from 'cheerio';
import { URL } from 'url';

async function scrapeWebsite(url: string) {
    try {
      const { data } = await axios.get(url);
      const selector = cheerio.load(data);
  
      // Remove script and style elements along with their content
      selector('script, style').remove();
  
      // Extract and log only the plaintext from the body of the website
      const plainText = selector('body').text().replace(/\s+/g, ' ').trim();
  
      console.log(plainText);
    } catch (error: any) {
      console.error(`Error scraping ${url}: `, error.message);
    }
}

async function scrapeWikipediaPage(url: string) {
  try {
    const { data } = await axios.get(url);
    const selector = cheerio.load(data);

    console.log({
        'title': selector('h1').first().text(),
        'summary': selector('p').first().text(),
        'infoBox': selector('.infobox').text(),
        'categories': selector('#mw-normal-catlinks ul li').map((i, el) => selector(el).text()).get(),
    });
  } catch (error: any) {
    console.error(`Error scraping ${url}: `, error.message);
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
    'https://en.wikipedia.org/wiki/Web_scraping',
    'https://www.google.com',
    'https://www.wikipedia.org',
    'https://en.wikipedia.org/wiki/Chihuahua_(dog_breed)'
]

function main() {
    const args = process.argv.slice(2);
    let urlsToScrape = [];
  
    if (args.length === 0) {
      urlsToScrape = urls; // Use predefined URLs if no arguments are passed
    } else {
      urlsToScrape.push(args[0]); // Use the argument as the URL to scrape
    }
  
    urlsToScrape.forEach(url => {
      if (!isValidUrl(url)) {
        console.log('One of the provided arguments is not a valid URL:', url);
        return;
      }
  
      if (url.includes('wikipedia.org')) {
        scrapeWikipediaPage(url);
      } else {
        scrapeWebsite(url);
      }
    });
  }

main();