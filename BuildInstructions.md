1. Update patchnotes
2. Update readme
3. Update version in both dockerfiles
4. Update version in package.json
5. Merge to master
6. Tag master with version
  * `git tag -a {version} -m "{version}"`
  * `git tag -a v0.1 -m "v0.1"`
7. Push tag
  * `git push --tags`
8. Build on ubuntu
  * `docker build -t macmondev/macmon-amd64:{version} .`
  * `docker build -t macmondev/macmon-amd64:0.1 . --no-cache`
9. Docker login
10. Push from ubuntu
  * `docker push macmondev/macmon-amd64:{version} `
  * `docker push macmondev/macmon-amd64:0.1`
11. Pull code from git on arm
12. Build on arm
  * `docker build -f DockerfileArm -t macmondev/macmon-arm64v8:{version} .`
  * `docker build -f DockerfileArm -t macmondev/macmon-arm64v8:0.1 .`
13. Push from arm
  * `Docker push macmondev/macmon-arm64v8:{version}`
  * `Docker push macmondev/macmon-arm64v8:0.1`
14. Pull arm image onto ubuntu
  * `Docker pull macmondev/macmon-arm64v8:{version}`
  * `Docker pull macmondev/macmon-arm64v8:0.1`
15. On ubuntu create image manifest list
```
docker manifest create macmondev/macmon:{version} \
macmondev/macmon-amd64:{version} \
macmondev/macmon-arm64v8:{version}
```
16. On ubuntu annotate manifest list for version for arm
  * `docker manifest annotate macmondev/macmon:{version} macmondev/macmon-arm64v8:{version} --os linux --arch arm`
17. On ubuntu push manifest list to docker hub
  * `docker manifest push macmondev/macmon:{version} --purge`
18. Build another manifest for latest
```
docker manifest create macmondev/macmon:latest \
macmondev/macmon-amd64:{version} \
macmondev/macmon-arm64v8:{version}
```
19. Annotate latest manifest list
  * `docker manifest annotate macmondev/macmon:latest macmondev/macmon-arm64v8:{version} --os linux --arch arm`
20. Push latest manifest list
  * `docker manifest push macmondev/macmon:latest --purge`
21. Update description on docker hub with latest Readme.md