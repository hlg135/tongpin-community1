const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "community.json");

const defaultData = {
  posts: [],
  likes: {},
  bookmarks: {},
  comments: {},
  likedBoards: [],
  likedMembers: [],
  joinedMembers: [],
  createdPosts: [],
  seedCount: 4,
  totalMembers: 12480,
  totalPosts: 3926,
  todayNew: 128,
  online: 342,
  version: 1
};

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf-8"));
  } catch {
    return JSON.parse(JSON.stringify(defaultData));
  }
};

const writeData = (data) => {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = { dataFile, defaultData, readData, writeData };
