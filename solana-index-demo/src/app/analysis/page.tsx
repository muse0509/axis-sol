'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../styles/Analysis.module.css';

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  const timeframes = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

  const analysisData = {
    overview: {
      title: "Index Performance Overview",
      description: "Comprehensive analysis of the Axis Solana Index performance across different timeframes and market conditions.",
      metrics: [
        { label: "Total Return", value: "+156.7%", change: "+12.3%", period: "YTD" },
        { label: "Volatility", value: "24.3%", change: "-2.1%", period: "vs S&P 500" },
        { label: "Sharpe Ratio", value: "1.87", change: "+0.15", period: "Risk-adjusted" },
        { label: "Max Drawdown", value: "-18.4%", change: "-5.2%", period: "vs Previous" }
      ]
    },
    composition: {
      title: "Index Composition Analysis",
      description: "Detailed breakdown of asset allocation, sector exposure, and rebalancing impact on performance.",
      sectors: [
        { name: "DeFi Protocols", allocation: 35, performance: "+23.4%" },
        { name: "Layer 1 Blockchains", allocation: 28, performance: "+18.7%" },
        { name: "Infrastructure", allocation: 22, performance: "+31.2%" },
        { name: "Gaming & Metaverse", allocation: 15, performance: "+12.8%" }
      ]
    },
    risk: {
      title: "Risk Analysis & Metrics",
      description: "Comprehensive risk assessment including volatility analysis, correlation metrics, and stress testing results.",
      riskMetrics: [
        { metric: "Value at Risk (95%)", value: "8.2%", riskLevel: "Low" },
        { metric: "Expected Shortfall", value: "12.1%", riskLevel: "Medium" },
        { metric: "Correlation with BTC", value: "0.67", riskLevel: "Moderate" },
        { metric: "Beta to Crypto Market", value: "0.89", riskLevel: "Low" }
      ]
    },
    comparison: {
      title: "Benchmark Comparison",
      description: "Performance comparison against traditional indices and crypto benchmarks to highlight relative strength.",
      benchmarks: [
        { name: "S&P 500", performance: "+12.4%", vsAxis: "+144.3%" },
        { name: "NASDAQ-100", performance: "+18.7%", vsAxis: "+138.0%" },
        { name: "BTC", performance: "+89.2%", vsAxis: "+67.5%" },
        { name: "ETH", performance: "+67.8%", vsAxis: "+88.9%" }
      ]
    }
  };

  const renderMetrics = (metrics: any[]) => (
    <div className={styles.metricsGrid}>
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          className={styles.metricCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className={styles.metricHeader}>
            <h4>{metric.label || metric.metric}</h4>
            <span className={styles.metricPeriod}>{metric.period}</span>
          </div>
          <div className={styles.metricValue}>{metric.value}</div>
          <div className={styles.metricChange}>
            {metric.change && (
              <span className={metric.change.startsWith('+') ? styles.positive : styles.negative}>
                {metric.change}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderSectors = (sectors: any[]) => (
    <div className={styles.sectorsContainer}>
      {sectors.map((sector, index) => (
        <motion.div
          key={index}
          className={styles.sectorCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className={styles.sectorHeader}>
            <h4>{sector.name}</h4>
            <span className={styles.sectorAllocation}>{sector.allocation}%</span>
          </div>
          <div className={styles.sectorPerformance}>
            <span className={sector.performance.startsWith('+') ? styles.positive : styles.negative}>
              {sector.performance}
            </span>
          </div>
          <div className={styles.sectorBar}>
            <div 
              className={styles.sectorBarFill} 
              style={{ width: `${sector.allocation}%` }}
            ></div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderBenchmarks = (benchmarks: any[]) => (
    <div className={styles.benchmarksContainer}>
      {benchmarks.map((benchmark, index) => (
        <motion.div
          key={index}
          className={styles.benchmarkCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className={styles.benchmarkName}>{benchmark.name}</div>
          <div className={styles.benchmarkPerformance}>
            <span className={benchmark.performance.startsWith('+') ? styles.positive : styles.negative}>
              {benchmark.performance}
            </span>
          </div>
          <div className={styles.benchmarkVsAxis}>
            vs Axis: 
            <span className={benchmark.vsAxis.startsWith('+') ? styles.positive : styles.negative}>
              {benchmark.vsAxis}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderContent = () => {
    const currentData = analysisData[activeTab as keyof typeof analysisData];
    
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <p className={styles.sectionDescription}>{currentData.description}</p>
            {renderMetrics((currentData as any).metrics)}
          </div>
        );
      case 'composition':
        return (
          <div>
            <p className={styles.sectionDescription}>{currentData.description}</p>
            {renderSectors((currentData as any).sectors)}
          </div>
        );
      case 'risk':
        return (
          <div>
            <p className={styles.sectionDescription}>{currentData.description}</p>
            {renderMetrics((currentData as any).riskMetrics)}
          </div>
        );
      case 'comparison':
        return (
          <div>
            <p className={styles.sectionDescription}>{currentData.description}</p>
            {renderBenchmarks((currentData as any).benchmarks)}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.title}
        >
          Index Analysis & Performance
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.subtitle}
        >
          Deep dive into the performance metrics, risk analysis, and comparative insights
        </motion.p>
      </div>

      <div className={styles.timeframeSelector}>
        <span className={styles.timeframeLabel}>Timeframe:</span>
        <div className={styles.timeframeButtons}>
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`${styles.timeframeButton} ${
                selectedTimeframe === timeframe ? styles.active : ''
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          {Object.keys(analysisData).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={styles.tabContent}
        >
          <h2 className={styles.sectionTitle}>
            {analysisData[activeTab as keyof typeof analysisData].title}
          </h2>
          {renderContent()}
        </motion.div>
      </div>

      <div className={styles.insights}>
        <h3>Key Insights</h3>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <h4>Strong Outperformance</h4>
            <p>The Axis Index has consistently outperformed traditional market indices, demonstrating the growth potential of the Solana ecosystem.</p>
          </div>
          <div className={styles.insightCard}>
            <h4>Risk Management</h4>
            <p>Our diversified approach and regular rebalancing help manage volatility while maintaining strong returns.</p>
          </div>
          <div className={styles.insightCard}>
            <h4>Market Correlation</h4>
            <p>Moderate correlation with Bitcoin provides diversification benefits while maintaining exposure to crypto growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
