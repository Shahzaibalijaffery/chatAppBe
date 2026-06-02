/** Reverse geocode lat/lng to a short area label via OpenStreetMap Nominatim. */
async function reverseGeocode(latitude, longitude) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "14");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": "mychatAppBe/1.0" },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const address = data.address || {};
  const suburb = address.suburb || address.neighbourhood || address.quarter;
  const city = address.city || address.town || address.village;
  const state = address.state;

  let areaName = null;
  if (suburb && city) {
    areaName = `${suburb} ${city}`;
  } else if (city && state) {
    areaName = `${city}, ${state}`;
  } else if (data.display_name) {
    areaName = data.display_name.split(",").slice(0, 2).join(",").trim();
  } else {
    areaName = city || state || null;
  }

  const country = address.country || null;

  return { areaName, city: city || null, country };
}

module.exports = { reverseGeocode };
