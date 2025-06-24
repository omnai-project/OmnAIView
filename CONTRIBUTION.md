# Contribution Guide

Thank you for your interest in contributing to **OmnAIView**!  
This guide outlines the workflow for submitting contributions.


## 1. Search existing issues 

Before you begin, look through the issue tracker for the feature or fix you have in mind.

## 2.1 Matching issue

Join the conversation and help decide who will take ownership.

## 2.2 No matching issue 

Use our issue template to describe the change you propose.

    >For bugs use the issue template. 
    >For features etc. use the other template. 
    >If you plan to implement it yourself, tick the “I’ll do it” box. 

## 3. Discussion about the issue

At least one maintainer (and probably other contributors) will review your issue. Together we will: 

1. give feedback

2. refine the approach

3. agree on a Definition of Done

The discussion is completed when a *Definition of Done* is approved by a maintainer of the project 

## 4. Assign responsibility

Within 24 hours after setting the Definition of Done, the issue will be assigned by a maintainer to

1. you, if you volunteered, or

2. another contributor with the right expertise.

If you are assigned, follow the workflow outlined below.

## 5. Fork the Repository

1. Navigate to the [OmnAIView repository](https://github.com/AI-Gruppe/OmnAIView).
2. Click the **Fork** button (top right) to create your own copy of the repository.

## 6. Clone Your Fork

Clone your fork to your local machine:

```sh
git clone git@github.com:AI-Gruppe/OmnAIView.git
cd OmnAIView
```

## 7. Create a Feature Branch

Before making changes, create a new branch:

```sh
git checkout -b feature/your-feature-name
```

Follow the naming convention:
- `feature/your-feature-name` for new features
- `fix/your-fix-description` for bug fixes
- `docs/update-readme` for documentation updates

## 8. Implement Your Changes

- Follow the project's coding standards.
- Ensure your code is properly formatted and linted.
- Write or update tests if applicable.

## 9. Commit Your Changes

Write meaningful commit messages:

```sh
git add .
git commit
```

It is expected that commits don't only have a header but also 
1. Why did you add/change something? 
2. What did you add/change in the commit? 
3. Possible important things to know about the commit.

## 10. Document your changes in the changelog 

To keep track of changes between different versions a changelog according to the (keepAChangelog)[https://keepachangelog.com/en/1.1.0/]
is used. 

It is expected that new changes are documented in this changelog. 

## 11. Push to Your Fork

Push your branch to your fork:

```sh
git push origin \<branchname\>
```

## 12. Open a Pull Request

1. Go to the original repository on GitHub.
2. Click **New Pull Request**.
3. Select your fork and branch.
4. Provide a **clear description** of your changes. Please follow our [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
5. Submit the pull request.

## 13. Review & Approval

- PRs must be reviewed by at least **two maintainers**.
- Address requested changes by updating your branch and pushing updates.
- Once approved, the PR will be merged by one of the maintainers. 

## 14. Keep Your Fork Updated

To stay up to date with the latest changes: 

```sh
git checkout master 
git fetch upstream
git merge upstream/master
git push origin master
```

Make sure that you have added the upstream to your git repo with: 

```
git remote add upstream git@github.com:AI-Gruppe/OmnAIView.git
```

## 15. Reporting Issues

If you find a bug or have a feature request, please open an [issue](https://github.com/AI-Gruppe/OmnAIView/issues) and describe it clearly.

---

**Happy coding!** If you have any questions, feel free to ask in [Discussions](https://github.com/AI-Gruppe/OmnAIView/discussions).

