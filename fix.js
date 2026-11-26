
require("dotenv").config();

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Listing = require("./models/listing");

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

async function updateCoordinates() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/Guniva");

        console.log("Connected to MongoDB!");

        // Find listings with missing or empty coordinates
        const listings = await Listing.find({
            location: { $exists: true, $ne: "" },
            $or: [
                { "geometry.coordinates": { $exists: false } },
                { "geometry.coordinates": { $size: 0 } }
            ]
        });

        console.log(`Found ${listings.length} listings to update`);

        for (let listing of listings) {
            try {
                console.log("Updating:", listing.title);

                const query = listing.country
                    ? `${listing.location}, ${listing.country}`
                    : listing.location;

                const response = await geocodingClient
                    .forwardGeocode({
                        query: query,
                        limit: 1
                    })
                    .send();

                if (!response.body.features.length) {
                    console.log("Location not found:", listing.location);
                    continue;
                }

                const geometry = response.body.features[0].geometry;

                if (
                    !geometry ||
                    !Array.isArray(geometry.coordinates) ||
                    geometry.coordinates.length !== 2
                ) {
                    console.log("Invalid coordinates:", listing.title);
                    continue;
                }

                listing.geometry = geometry;
                await listing.save();

                console.log("Successfully updated:", listing.title);

            } catch (error) {
                console.log("Error updating:", listing.title, error.message);
            }
        }

        console.log("Coordinate update completed!");

    } catch (error) {
        console.log(error);
    } finally {
        await mongoose.disconnect();
    }
}

updateCoordinates();
