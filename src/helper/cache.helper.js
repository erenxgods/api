import axios from "axios";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const REDIS_URL = process.env.CACHE_URL; // Your Redis connection string
const redisClient = createClient({ url: REDIS_URL });

// Connect to Redis
const connectToRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Could not connect to Redis:", error);
  }
};

// Call the connect function
connectToRedis();

export const getCachedData = async (key) => {
  try {
    // Check Redis cache first
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      console.log("Data retrieved from cache");
      return JSON.parse(cachedData); // Assuming the cached data is stored as JSON
    }
    console.log("Cache miss, fetching data from API");
    return null; // Key not found in cache
  } catch (error) {
    console.error("Error getting cached data:", error);
    throw error;
  }
};

export const setCachedData = async (key, value) => {
  try {
    await redisClient.set(key, JSON.stringify(value)); // Store data as JSON
    console.log("Data cached successfully");
  } catch (error) {
    console.error("Error setting cache data:", error);
    throw error;
  }
};

export const fetchData = async (url, key) => {
  const cachedData = await getCachedData(key);
  if (cachedData) {
    return cachedData; // Return cached data if available
  }

  // If not cached, make the Axios request
  try {
    const response = await axios.get(url);
    await setCachedData(key, response.data); // Cache the fetched data
    return response.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
};

// Optionally, you can add a disconnect function
export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    console.log("Disconnected from Redis");
  } catch (error) {
    console.error("Error disconnecting from Redis:", error);
  }
};