"use client";

import React from "react";
import { 
  MapPin, 
  Users, 
  ShieldAlert, 
  Activity, 
  Smile, 
  Meh, 
  Frown, 
  SmilePlus,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export interface CommunityIntelligenceCardProps {
  id: string;
  name: string;
  location: string;
  municipality: string;
  population: string;
  priorityScore: "High Risk" | "Moderate" | "Stable" | "Urgent Action";
  infrastructureScore: number;
  sentiment: {
    value: string;
    icon: "satisfied" | "dissatisfied" | "very_satisfied" | "neutral";
    trend: string;
  };
  image: string;
}

const getPriorityColor = (score: string) => {
  switch (score) {
    case "High Risk":
    case "Urgent Action":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "Moderate":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Stable":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

const getSentimentIcon = (icon: string) => {
  switch (icon) {
    case "very_satisfied":
      return <SmilePlus className="w-4 h-4 text-emerald-500" />;
    case "satisfied":
      return <Smile className="w-4 h-4 text-emerald-400" />;
    case "dissatisfied":
      return <Frown className="w-4 h-4 text-red-500" />;
    case "neutral":
      return <Meh className="w-4 h-4 text-slate-400" />;
    default:
      return <Smile className="w-4 h-4" />;
  }
};

const getSentimentColor = (icon: string) => {
  switch (icon) {
    case "very_satisfied": return "text-emerald-500";
    case "satisfied": return "text-emerald-400";
    case "dissatisfied": return "text-red-500";
    default: return "text-slate-400";
  }
};

export const CommunityIntelligenceCard: React.FC<CommunityIntelligenceCardProps> = ({
  id,
  name,
  location,
  municipality,
  population,
  priorityScore,
  infrastructureScore,
  sentiment,
  image,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-[#0B0F17]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:shadow-primary/20 transition-all duration-300"
    >
      {/* Header Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/20 to-transparent" />
        
        {/* ID Badge */}
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
          <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
            ID: {id}
          </span>
        </div>

        {/* Name & Location Overlay */}
        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-light transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 text-white/70 text-xs">
            <MapPin className="w-3 h-3 text-primary-light" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Municipality</p>
            <p className="text-sm font-medium text-white/90">{municipality}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Population</p>
            <div className="flex items-center gap-1.5 justify-end">
              <Users className="w-3 h-3 text-primary-light/60" />
              <p className="text-sm font-medium text-white/90">{population}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Priority Score */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 font-medium">Priority Score</span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(priorityScore)}`}>
              {priorityScore}
            </span>
          </div>

          {/* Infrastructure Health */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50 font-medium">Infrastructure Health</span>
              <span className="text-primary-light font-bold">{infrastructureScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${infrastructureScore}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full rounded-full bg-gradient-to-r ${
                  infrastructureScore < 40 ? 'from-red-500 to-orange-500' : 
                  infrastructureScore < 70 ? 'from-orange-500 to-primary' : 
                  'from-primary to-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Sentiment Indicator */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-white/50 font-medium">Community Sentiment</span>
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 ${getSentimentColor(sentiment.icon)}`}>
              {getSentimentIcon(sentiment.icon)}
              <span className="text-xs font-bold">{sentiment.trend}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href={`/communities/${id.startsWith('comm-') ? id : `comm-${id}`}`}
          className="w-full mt-2 py-3 bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          View Detailed Insights
          <ArrowUpRight className="w-3 h-3 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Hover Glimmer Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};
