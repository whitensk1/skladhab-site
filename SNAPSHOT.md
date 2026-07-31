# Snapshots / откат

## v1 — до клона структуры FFSPACE

- **Tag:** `v1-pre-ffspace-clone`
- **Branch:** `archive/v1-premium-blue`
- **Commit:** `507a368` — light blue palette, compact hero/stats/partners/about/contact

### Откат на эту версию

```bash
# только посмотреть
git checkout v1-pre-ffspace-clone

# вернуть main на snapshot (осторожно, перепишет main)
git checkout main
git reset --hard v1-pre-ffspace-clone
git push --force origin main   # только если согласовано
```

Или открыть ветку: `archive/v1-premium-blue`.
