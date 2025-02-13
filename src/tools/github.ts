import { t, tool } from '@agent/tool';
import { REASON_PARAMETER_SCHEMA } from '../utils.js';
import { Ok } from '@agent/tool/result';
import { Octokit } from 'octokit';

const octokitClient = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

type ListUserBlogsResponse = {
    viewer: {
        repositoryDiscussions: {
            nodes: Array<{
                title: string;
                number: number;
                repository: {
                    nameWithOwner: string;
                };
            }>;
        };
    };
}

export const listUserBlogs = tool({
    name: 'listUserBlogs',
    description: 'Retrieves a list of the user\'s recent blogs. Only the title, number, and repository are returned. To fetch a blog\'s content, use the `getUserBlog` tool. All blogs returned are written by the user.',
    input: t.object({
        reason: REASON_PARAMETER_SCHEMA,
    }),
    execute: async (_input) => {
        const resp = await octokitClient.graphql<ListUserBlogsResponse>(`query {
            viewer {
              repositoryDiscussions (first: 100) {
                nodes {
                  title
                  number
                  repository {
                    nameWithOwner
                  }
                }
              }
            }
          }`);

        return Ok(resp.viewer.repositoryDiscussions.nodes.map((blog) => `Repository: ${blog.repository.nameWithOwner} | Number: ${blog.number} | Title: ${blog.title}`).join('\n'));
    },
});

type GetUserBlogResponse = {
    repository: {
        discussion: {
            body: string;
        };
    };
}

export const getUserBlog = tool({
    name: 'getUserBlog',
    description: 'Retrieves a blog\'s content by its number and repository.',
    input: t.object({
        reason: REASON_PARAMETER_SCHEMA,
        repository: t.string({
            description: 'The repository to get the blog from.',
            examples: ['octokit/rest.js', 'facebook/react', 'cmbrose/actions'],
        }),
        discussionNumber: t.integer({
            description: 'The discussion number to get.',
            examples: [123],
        }),
    }),
    execute: async (input) => {
        const [owner, repo] = input.repository.split('/');

        const resp = await octokitClient.graphql<GetUserBlogResponse>(`query {
            repository(owner: "${owner}", name: "${repo}") {
              discussion (number: ${input.discussionNumber}) {
                body
              }
            }
          }`);

        return Ok(resp.repository.discussion.body);
    },
});
