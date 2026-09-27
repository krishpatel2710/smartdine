const git = require("isomorphic-git");
const fs = require("fs");
const path = require("path");

async function initAndCommit() {
  const dir = path.resolve(__dirname, "..");
  console.log("Initializing git repository in:", dir);

  // 1. Git init
  await git.init({ fs, dir, defaultBranch: "main" });
  console.log("✓ Git repository initialized with default branch 'main'.");

  // Helper to recursively get all files not ignored
  function getFiles(currentDir, baseDir = "") {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      const relative = path.join(baseDir, entry.name).replace(/\\/g, "/");
      if (
        entry.name === ".git" ||
        entry.name === "node_modules" ||
        (baseDir === "backend" && entry.name === "node_modules") ||
        entry.name === "dist" ||
        entry.name === "dist-ssr" ||
        entry.name === ".env" ||
        (baseDir === "backend" && entry.name === ".env") ||
        entry.name.endsWith(".log")
      ) {
        continue;
      }
      if (entry.isDirectory()) {
        files = files.concat(getFiles(path.join(currentDir, entry.name), relative));
      } else {
        files.push(relative);
      }
    }
    return files;
  }

  const allFiles = getFiles(dir);
  console.log(`Staging ${allFiles.length} files...`);

  for (const file of allFiles) {
    await git.add({ fs, dir, filepath: file });
  }

  console.log("Creating initial commit...");
  const sha = await git.commit({
    fs,
    dir,
    message: "feat: complete SmartDine full-stack restaurant ordering system\n\n- React 19 + Vite responsive frontend with pure vegetarian theme\n- Node.js & Express REST APIs with JWT auth and MySQL support\n- Google Gemini AI Food Assistant with movable burger avatar\n- Complete customer order flow, table QR ordering, and tracking\n- Kitchen Display System (KDS) & Admin Dashboard with Daily Order Volume and Reports\n- Render, Vercel, and Docker deployment configurations",
    author: {
      name: "Krish Patel",
      email: "krishpatel2710@users.noreply.github.com",
    },
  });

  console.log("✓ Initial commit created with SHA:", sha);

  // Set remote
  const repoUrl = "https://github.com/krishpatel2710/smartdine.git";
  try {
    await git.addRemote({
      fs,
      dir,
      remote: "origin",
      url: repoUrl,
      force: true,
    });
    console.log(`✓ Remote 'origin' configured: ${repoUrl}`);
  } catch (e) {
    console.log("Remote note:", e.message);
  }

  console.log("\n=======================================================");
  console.log("🎉 Git repository is fully initialized and committed!");
  console.log(`Target: https://github.com/krishpatel2710/smartdine`);
  console.log("=======================================================\n");
}

initAndCommit().catch((err) => {
  console.error("Error initializing git repository:", err);
  process.exit(1);
});
