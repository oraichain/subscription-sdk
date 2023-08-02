## Generate code and docs

```bash
# build code:
cwtools build ../cosmwasm-subscription -o packages/contracts-build/data
# gen code:
cwtools gents ../cosmwasm-subscription -o packages/contracts-sdk/src
# gen doc:
yarn docs

# build
yarn build . --outDir build
# build individual packages
yarn build packages/contracts-sdk
yarn build packages/contracts-build
# publish package
yarn deploy packages/contracts-sdk --patch
yarn deploy packages/contracts-build --patch

# update comments:
git apply patches/contracts-sdk.patch
# edit contracts-sdk
git diff packages/contracts-sdk > patches/contracts-sdk.patch
# rollback
git checkout packages/contracts-sdk
```
