#!/usr/bin/env python3
"""
JAXA Earth API で大阪湾の海面水温・クロロフィルa濃度を取得し、
kansai-fishing-v2.jsx の JAXA_DATA 定数を自動更新するスクリプト。

前提:
  pip install ./jaxa-earth-0.1.5.zip   # JAXA公式サイトからDLしたzipを使用

使い方:
  python fetch_jaxa.py              # 今月のデータを取得
  python fetch_jaxa.py 2026-02      # 指定月のデータを取得
  python fetch_jaxa.py --search     # 利用可能なSST/CHLAコレクション一覧を表示
"""

import sys
import json
import re
from calendar import monthrange
from datetime import datetime
from pathlib import Path
import numpy as np

try:
    from jaxa.earth import je
except ImportError:
    print("Error: jaxa-earth がインストールされていません。")
    print("  1. https://data.earth.jaxa.jp/api/python/ からzipをダウンロード")
    print("  2. pip install ./jaxa-earth-0.1.5.zip")
    sys.exit(1)

# 大阪湾の範囲
BBOX = [134.5, 34.0, 136.0, 35.0]
PPU  = 10  # 解像度 (pixels per unit degree)

# JAXA GCOM-C/SGLI コレクションID
SST_COLLECTION  = "JAXA.G-Portal_GCOM-C.SGLI_standard.L3-SST.daytime.v3_global_monthly"
CHLA_COLLECTION = "JAXA.G-Portal_GCOM-C.SGLI_standard.L3-CHLA.daytime.v3_global_monthly"


def month_range(ym: str) -> list[str]:
    year, month = map(int, ym.split("-"))
    _, last = monthrange(year, month)
    return [f"{ym}-01T00:00:00", f"{ym}-{last:02d}T23:59:59"]


def fetch_mean(collection: str, band: str, dlim: list[str]) -> float | None:
    """指定コレクション・バンド・期間の大阪湾平均値を返す。"""
    try:
        data = (
            je.ImageCollection(collection=collection, ssl_verify=True)
            .filter_date(dlim=dlim)
            .filter_resolution(ppu=PPU)
            .filter_bounds(bbox=BBOX)
            .select(band=band)
            .get_images()
        )
        stats = je.ImageProcess(data).calc_spatial_stats()
        means = stats.timeseries.get("mean", [])
        if means is not None and len(means) > 0:
            # 0次元numpy配列も通常のfloatも両方対応
            val = np.asarray(means[0]).flat[0]
            return round(float(val), 2)
        return None
    except Exception as e:
        print(f"  取得失敗 ({collection}): {e}", file=sys.stderr)
        return None


def search_collections():
    """SST・CHLA関連のコレクション一覧を表示する（デバッグ用）。"""
    for keywords in [["SST", "GCOM"], ["CHLA", "GCOM"]]:
        print(f"\nキーワード: {keywords}")
        try:
            collections, bands = (
                je.ImageCollectionList(ssl_verify=True).filter_name(keywords=keywords)
            )
            for c, b in zip(collections, bands):
                print(f"  {c}  band={b}")
        except Exception as e:
            print(f"  エラー: {e}")


def patch_jsx(sst, chla, ym: str):
    jsx_path = Path(__file__).parent / "kansai-fishing-v2.jsx"
    if not jsx_path.exists():
        print(f"JSXファイルが見つかりません: {jsx_path}", file=sys.stderr)
        return
    text = jsx_path.read_text(encoding="utf-8")
    updated_at = datetime.now().strftime("%Y-%m-%d %H:%M")
    new_const = (
        f'const JAXA_DATA={{sst:{json.dumps(sst)},chla:{json.dumps(chla)},'
        f'month:"{ym}"}}; // JAXA更新: {updated_at}'
    )
    patched, n = re.subn(r"const JAXA_DATA=\{[^\n]+\};[^\n]*", new_const, text)
    if n == 0:
        print("警告: JSXにJAXA_DATA定数が見つかりません。", file=sys.stderr)
    else:
        jsx_path.write_text(patched, encoding="utf-8")
        print("✓ JSX更新完了")


def main():
    if "--search" in sys.argv:
        search_collections()
        return

    ym = next((a for a in sys.argv[1:] if not a.startswith("-")),
               datetime.now().strftime("%Y-%m"))
    dlim = month_range(ym)

    print(f"JAXA GCOM-C衛星データ取得中 ({ym})  bbox={BBOX} ...")

    sst  = fetch_mean(SST_COLLECTION,  "SST",  dlim)
    chla = fetch_mean(CHLA_COLLECTION, "CHLA", dlim)

    print(f"  海面水温:      {sst}°C"    if sst  is not None else "  海面水温:      取得失敗")
    print(f"  クロロフィルa: {chla} μg/L" if chla is not None else "  クロロフィルa: 取得失敗")

    # JSON出力
    result = {"sst": sst, "chla": chla, "month": ym}
    print(json.dumps(result, ensure_ascii=False, indent=2))

    patch_jsx(sst, chla, ym)


if __name__ == "__main__":
    main()
