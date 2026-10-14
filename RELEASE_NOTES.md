# Mallowbits v1.0.1

- The gallery’s complete-pack link points to its fixed release version instead of depending on the latest release.
- One smaller ZIP runs at a time, including when filters change. PNG sizes and SHA-256 hashes are checked before packaging.
- Smaller ZIPs include original PNGs, a consistent PNG-only catalog, filtered generation records, CC0, MIT and license-scope files.
- Build and packaging refuse uncataloged artwork, symlinks, secrets and private folders. Existing releases are preserved.
- A failed catalog request now offers Retry loading.

The original 60 PNGs and 60 WebP previews are unchanged. Artwork CC0 in the creator's held rights; gallery code MIT. AI and third-party-rights limits remain as described in ASSET_LICENSES.md.

Download mallowbits-v1.0.1.zip and check SHA256SUMS.
