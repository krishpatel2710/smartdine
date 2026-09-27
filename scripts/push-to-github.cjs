const git = require("isomorphic-git");
const http = require("isomorphic-git/http/node");
const fs = require("fs");
const path = require("path");

async function pushToGitHub() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN;
  const repoName = process.argv[3] || "smartdine";
  const username = "krishpatel2710";

  if (!token) {
    console.log("==================================================================");
    console.log("GitHub Token Required");
    console.log("==================================================================");
    console.log(`\nTo create repository and push to https://github.com/${username}/${repoName}:`);
    console.log("\n1. Generate a GitHub Personal Access Token with 'repo' scope at:");
    console.log("   https://github.com/settings/tokens/new?scopes=repo&description=SmartDine-Deploy");
    console.log("\n2. Run this command:");
    console.log("   node scripts/push-to-github.cjs YOUR_GITHUB_TOKEN");
    console.log("==================================================================\n");
    process.exit(1);
  }

  console.log(`\n1. Creating repository '${repoName}' on GitHub for user '${username}'...`);

  try {
    const createRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "SmartDine-Git-Uploader",
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        description: "SmartDine – Full-Stack Smart Restaurant Ordering System with React, Node.js, MySQL & Google Gemini AI",
        private: false,
        has_issues: true,
        has_projects: true,
        has_wiki: true,
      }),
    });

    if (createRes.status === 201) {
      console.log(`✓ Created new repository on GitHub: https://github.com/${username}/${repoName}`);
    } else if (createRes.status === 422) {
      console.log(`✓ Repository '${repoName}' already exists on GitHub. Proceeding to push...`);
    } else {
      const errData = await createRes.json().catch(() => ({}));
      console.log(`GitHub API note: ${errData.message || createRes.statusText}`);
    }
  } catch (e) {
    console.warn("Could not query GitHub API, attempting direct push...", e.message);
  }

  const dir = path.resolve(__dirname, "..");
  const repoUrl = `https://github.com/${username}/${repoName}.git`;

  console.log(`\n2. Pushing code to ${repoUrl}...`);

  try {
    await git.push({
      fs,
      http,
      dir,
      remote: "origin",
      ref: "main",
      remoteRef: "main",
      force: true,
      onAuth: () => ({
        username: token,
        password: "",
      }),
    });

    console.log("\n==================================================================");
    console.log("🎉 SUCCESS! SmartDine has been uploaded to GitHub!");
    console.log(`🔗 Live Repository: https://github.com/${username}/${repoName}`);
    console.log("==================================================================\n");
  } catch (err) {
    console.error("\nPush failed:", err.message);
    if (err.message.includes("401") || err.message.includes("403") || err.message.includes("HTTP error")) {
      console.error("\nPlease check that your GitHub token is valid and has 'repo' permissions enabled.");
    }
    process.exit(1);
  }
}

pushToGitHub();
