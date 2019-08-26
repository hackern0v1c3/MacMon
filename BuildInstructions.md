1. Update patchnotes
2. Update readme
3. Update version in dockerfile
4. Update version in package.json
5. Merge to master
6. Tag master with version
  * `git tag -a {version} -m "{version}"`
  * `git tag -a 0.1 -m "0.1"`
7. Push tag
  * `git push --tags`
8. Docker login
9. Build using build script
  * `./build -v {version} .`
  * `./build -v 0.1`
10. Update description on docker hub with latest Readme.md