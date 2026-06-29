export const siteConfig = {
  name: "CommWire",
  description: "Commodity Markets News Intelligence",
  url: process.env.SITE_URL || "https://commwire.app",
  author: "CommWire",
  twitter: "@commwire",
};

export const categories = [
  { id: "gold", label: "Gold", icon: "🥇" },
  { id: "silver", label: "Silver", icon: "🥈" },
  { id: "oil", label: "Oil", icon: "🛢️" },
  { id: "gas", label: "Gas", icon: "🔥" },
  { id: "metals", label: "Mining & Metals", icon: "⛏️" },
  { id: "agriculture", label: "Agriculture", icon: "🌾" },
];

export const navigation = [
  { title: "Trending", url: "/trending" },
  { title: "Gold", url: "/gold" },
  { title: "Silver", url: "/silver" },
  { title: "Oil", url: "/oil" },
  { title: "Gas", url: "/gas" },
  { title: "Metals", url: "/metals" },
  { title: "Agriculture", url: "/agriculture" },
];
