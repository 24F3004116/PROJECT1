import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_USERNAME;

export const createOrGetRepo = async (repoName) => {
  try {
    const { data } = await octokit.repos.get({ owner, repo: repoName });
    console.log(`Repo "${repoName}" already exists.`);
    return data;
  } catch (error) {
    if (error.status === 404) {
      console.log(`Repo "${repoName}" not found. Creating it...`);
      const { data } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        private: false,
        auto_init: true,
      });
      return data;
    }
    throw error;
  }
};

export const getFileContentFromRepo = async (repoName, path) => {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo: repoName,
      path,
    });
    return Buffer.from(data.content, 'base64').toString('utf8');
  } catch (error) {
    console.error(`Failed to get file content for ${path} from ${repoName}. It might not exist yet.`);
    return '';
  }
};

export const pushFilesToRepo = async (repoName, files, commitMessage) => {
  const { data: refData } = await octokit.git.getRef({ owner, repo: repoName, ref: 'heads/main' });
  const parentSha = refData.object.sha;

  const { data: parentCommitData } = await octokit.git.getCommit({ owner, repo: repoName, commit_sha: parentSha });
  const baseTreeSha = parentCommitData.tree.sha;

  const blobPromises = files.map(file =>
    octokit.git.createBlob({ owner, repo: repoName, content: file.content, encoding: 'utf-8' })
  );
  const blobs = await Promise.all(blobPromises);

  const tree = blobs.map((blob, index) => ({
    path: files[index].path,
    mode: '100644',
    type: 'blob',
    sha: blob.data.sha,
  }));

  const { data: treeData } = await octokit.git.createTree({ owner, repo: repoName, tree, base_tree: baseTreeSha });
  const { data: commitData } = await octokit.git.createCommit({ owner, repo: repoName, message: commitMessage, tree: treeData.sha, parents: [parentSha] });
  await octokit.git.updateRef({ owner, repo: repoName, ref: 'heads/main', sha: commitData.sha });
  
  return commitData.sha;
};

export const enableGitHubPages = async (repoName) => {
  try {
    await octokit.repos.createPagesSite({
      owner,
      repo: repoName,
      source: { branch: 'main', path: '/' },
    });
    console.log('GitHub Pages enabled.');
  } catch (error) {
    if (error.response?.data?.message?.includes('already has a GitHub Pages site')) {
      console.log('GitHub Pages is already enabled for this repo.');
    } else {
      throw error;
    }
  }
};