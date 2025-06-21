import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import timedelta
from pandas.tseries.offsets import BDay

st.set_page_config(layout="wide")
st.title("📈 効率的フロンティア × SML × バックテスト")

# 入力
default_tickers = "AAPL, MSFT, NVDA, GOOGL, AMZN, META, TSLA, AMD, AVGO, ASML, PLTR, SNOW, HWM, PM, APP, NFLX, OKLO, SPOT, T, AXON, QUBT, CRDO, NOW, IAU, CEG, GEV, CRWD, GFI, DUOL, ASTS, ORCL, VEON, HMY, RDDT, GS, TLN, BABA, TTWO, JNJ, SE, KO, LLY, RDW, WMT, ALK, RJF, COIN"
use_preset = st.checkbox("📌 おすすめ銘柄セットを使う", value=True)
tickers = st.text_input("ティッカーをカンマで入力", default_tickers if use_preset else "")
period = st.selectbox("分析期間", ["1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y"], index=1)

@st.cache_data
def select_tickers_above_sml(returns, tickers, bench_tickers):
    annual_ret = returns[tickers].mean() * 252
    annual_vol = returns[tickers].std() * np.sqrt(252)
    bench_annual = pd.DataFrame({
        'ティッカー': bench_tickers,
        'リターン': returns[bench_tickers].mean() * 252,
        'リスク': returns[bench_tickers].std() * np.sqrt(252)
    })
    slope = (bench_annual.loc[bench_annual['ティッカー'] == '^NYFANG', 'リターン'].values[0] -
             bench_annual.loc[bench_annual['ティッカー'] == 'SPY', 'リターン'].values[0]) / \
            (bench_annual.loc[bench_annual['ティッカー'] == '^NYFANG', 'リスク'].values[0] -
             bench_annual.loc[bench_annual['ティッカー'] == 'SPY', 'リスク'].values[0])
    intercept = bench_annual.loc[bench_annual['ティッカー'] == 'SPY', 'リターン'].values[0] - \
                slope * bench_annual.loc[bench_annual['ティッカー'] == 'SPY', 'リスク'].values[0]
    is_above = annual_ret > (slope * annual_vol + intercept)
    selected = annual_ret[is_above].index.tolist()
    return selected, annual_ret, annual_vol, bench_annual

try:
    ticker_list = [t.strip() for t in tickers.split(",") if t.strip()]
    if not ticker_list:
        st.warning("ティッカーを入力してください")
        st.stop()

    all_tickers = list(set(ticker_list + ['SPY', 'QQQ', '^NYFANG']))
    data = yf.download(all_tickers, period=period, auto_adjust=True)['Close'].dropna(how='all')
    returns = data.pct_change().dropna()

    selected_tickers, ann_ret, ann_vol, bench_annual = select_tickers_above_sml(
        returns, ticker_list, ['SPY', 'QQQ', '^NYFANG']
    )
    st.success(f"✅ SMLより上にある銘柄: {', '.join(selected_tickers)}")

    mean_returns = returns[selected_tickers].mean() * 252
    cov_matrix = returns[selected_tickers].cov() * 252

    def calculate_drawdown(series):
        cummax = series.cummax()
        return (series / cummax - 1).min()

    results = []
    for _ in range(10000):
        weights = np.random.random(len(selected_tickers))
        weights /= np.sum(weights)
        ret = np.dot(weights, mean_returns)
        vol = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        port_series = (returns[selected_tickers] * weights).sum(axis=1).add(1).cumprod()
        mdd = calculate_drawdown(port_series)
        sharpe = ret / vol
        results.append({
            "リターン": ret,
            "リスク": vol,
            "シャープ": sharpe,
            "最大ドローダウン": float(mdd),
            **{t: w for t, w in zip(selected_tickers, weights)}
        })

    df = pd.DataFrame(results)
    max_idx = df["シャープ"].idxmax()
    max_point = df.loc[max_idx]

    fig = px.scatter(df, x="リスク", y="リターン", color="シャープ", color_continuous_scale="Viridis")
    fig.add_trace(go.Scatter(
        x=[max_point["リスク"]], y=[max_point["リターン"]],
        mode='markers', marker=dict(size=12, color='red', symbol='star'),
        name='最大Sharpe'
    ))
    fig.add_trace(go.Scatter(
        x=bench_annual['リスク'], y=bench_annual['リターン'],
        mode='lines+markers+text', text=bench_annual['ティッカー'],
        name='インデックス線', textposition='top center', line=dict(dash='dot', color='red')
    ))
    st.plotly_chart(fig)

    st.metric("📈 年率リターン", f"{max_point['リターン']:.2%}")
    st.metric("📉 年率リスク", f"{max_point['リスク']:.2%}")
    st.metric("📉 最大ドローダウン", f"{max_point['最大ドローダウン']:.2%}")
    st.metric("⭐ 最大シャープレシオ", f"{max_point['シャープ']:.2f}")

    st.subheader("📦 最大シャープレシオポートフォリオ構成")
    opt_weights = pd.DataFrame({
        'ティッカー': selected_tickers,
        '割合': [f"{max_point[t]:.2%}" for t in selected_tickers]
    })
    st.dataframe(opt_weights)

    # 固定ポートフォリオ バックテスト
    opt_weights_array = np.array([max_point[t] for t in selected_tickers])
    cumulative_return = (returns[selected_tickers] @ opt_weights_array + 1).cumprod()

    st.subheader("📊 通常バックテスト結果（固定ポートフォリオ）")
    fig_bt = go.Figure()
    fig_bt.add_trace(go.Scatter(
        x=cumulative_return.index,
        y=cumulative_return.values,
        mode='lines',
        name='固定ポートフォリオ',
        line=dict(color='green')
    ))
    fig_bt.update_layout(xaxis_title="日付", yaxis_title="累積リターン", height=400)
    st.plotly_chart(fig_bt)
    st.metric("📈 期間中トータルリターン", f"{(cumulative_return.iloc[-1] - 1):.2%}")

except Exception as e:
    st.error(f"❌ エラーが発生しました: {e}")
