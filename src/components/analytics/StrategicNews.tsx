"use client";

import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Globe, Clock, ArrowRight } from 'lucide-react';

export default function StrategicNews({ articles }: { articles: any[] }) {
    if (!articles || articles.length === 0) return (
        <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
            <Newspaper className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching news signatures in this region</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Live Institutional News Feed</h4>
                    <p className="text-sm font-bold text-gray-900 uppercase">Regional Media Evidence</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Live Sync</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col h-full"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block uppercase whitespace-nowrap">
                                    {article.source?.name || 'News Source'}
                                </span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {new Date(article.publishedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <a
                                href={article.url}
                                target="_blank"
                                className="p-2 bg-gray-50 text-gray-400 hover:text-blue-500 rounded-lg transition-colors border border-gray-100"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <h5 className="text-xs font-black text-gray-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors uppercase">
                            {article.title}
                        </h5>

                        <p className="text-[10px] text-gray-500 leading-relaxed font-bold line-clamp-2 mb-6 flex-1">
                            {article.description}
                        </p>

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Institutional Evidence</span>
                            <ArrowRight className="w-3 h-3 text-gray-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
