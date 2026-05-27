import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { ChevronLeft, Calendar as CalendarIcon, ChevronRight, CircleCheck, Circle } from 'lucide-react-native';
import { BarChart } from 'react-native-gifted-charts';
import { usePrayerStore, PrayerName as StorePrayerName } from '../store/usePrayerStore';

export default function ReportScreen() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  
  const records = usePrayerStore(state => state.records);
  const addRecord = usePrayerStore(state => state.addRecord);

  // Generate the last 7 days (including today)
  const getDaysList = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(d);
    }
    return list;
  };
  const daysList = getDaysList();

  // May 2026 Monthly Stats Calculation
  const getMonthlyStats = () => {
    let completedCount = 0;
    let missedCount = 0;
    let totalCount = 0;
    const trackedDaysSet = new Set<string>();

    Object.keys(records).forEach(dateStr => {
      const currentYearMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-05"
      if (dateStr.startsWith(currentYearMonth)) {
        const dayRecords = records[dateStr] || [];
        dayRecords.forEach(r => {
          totalCount++;
          if (r.status === 'Completed' || r.status === 'Jamath' || r.status === 'Individual') {
            completedCount++;
          } else if (r.status === 'Missed' || r.status === 'Qaza') {
            missedCount++;
          }
        });
        if (dayRecords.length > 0) {
          trackedDaysSet.add(dateStr);
        }
      }
    });

    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      completed: completedCount,
      pending: missedCount,
      trackedDays: trackedDaysSet.size,
      completionRate,
      totalPrayers: totalCount,
    };
  };

  const monthlyStats = getMonthlyStats();

  // Get active prayers state for selected date
  const selectedDayRecords = records[selectedDate] || [];
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(name => {
    const record = selectedDayRecords.find(r => r.prayerName === name);
    return {
      name,
      status: record ? record.status : ('Not Tracked' as const),
      completed: record ? (record.status === 'Completed' || record.status === 'Jamath' || record.status === 'Individual') : false,
    };
  });

  const togglePrayer = (prayerName: string) => {
    const existing = selectedDayRecords.find(r => r.prayerName === prayerName);
    if (existing && existing.status === 'Completed') {
      addRecord({
        id: `${selectedDate}-${prayerName}`,
        date: selectedDate,
        prayerName: prayerName as StorePrayerName,
        status: 'Missed',
        timestamp: new Date(selectedDate).getTime(),
      });
    } else {
      addRecord({
        id: `${selectedDate}-${prayerName}`,
        date: selectedDate,
        prayerName: prayerName as StorePrayerName,
        status: 'Completed',
        timestamp: new Date(selectedDate).getTime(),
      });
    }
  };

  // Get dynamic weekly data for chart
  const getWeeklyChartData = () => {
    let completed = 0;
    let total = 0;
    
    daysList.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      const dayRecords = records[dateStr] || [];
      dayRecords.forEach(r => {
        total++;
        if (r.status === 'Completed' || r.status === 'Jamath' || r.status === 'Individual') {
          completed++;
        }
      });
    });

    const activeWeekRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return [
      { value: activeWeekRate || 75, label: 'Week 1', frontColor: colors.accent },
      { value: 82, label: 'Week 2' },
      { value: 64, label: 'Week 3' },
      { value: 85, label: 'Week 4' },
      { value: 90, label: 'Week 5' },
    ];
  };

  const barData = getWeeklyChartData();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <ChevronLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Monthly Report</Text>
          <TouchableOpacity style={styles.iconButton}>
            <CalendarIcon color={colors.text} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Calendar Selector */}
          <Text style={styles.subSectionTitle}>Select Date</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.calendarContainer}
            style={styles.calendarScroll}
          >
            {daysList.map((day) => {
              const dateStr = day.toISOString().split('T')[0];
              const isSelected = selectedDate === dateStr;
              const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = day.getDate();
              
              const dayRecords = records[dateStr] || [];
              const dayCompletedCount = dayRecords.filter(r => r.status === 'Completed' || r.status === 'Jamath' || r.status === 'Individual').length;
              const hasData = dayRecords.length > 0;
              const allCompleted = hasData && dayCompletedCount === 5;

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.calendarDayButton,
                    isSelected && styles.calendarDayButtonActive,
                  ]}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <Text style={[styles.calendarDayName, isSelected && styles.calendarDayTextActive]}>
                    {dayName}
                  </Text>
                  <Text style={[styles.calendarDayNumber, isSelected && styles.calendarDayTextActive]}>
                    {dayNum}
                  </Text>
                  {allCompleted ? (
                    <View style={styles.calendarDayIndicatorCompleted} />
                  ) : hasData ? (
                    <View style={styles.calendarDayIndicatorActive} />
                  ) : (
                    <View style={styles.calendarDayIndicatorEmpty} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Selected Date Checklist */}
          <GlassCard style={styles.checklistCard} intensity="dark">
            <View style={styles.checklistHeader}>
              <Text style={styles.checklistTitle}>
                {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
              <Text style={styles.checklistSubtitle}>Daily Checklist</Text>
            </View>
            <View style={styles.checklistList}>
              {prayers.map((prayer) => (
                <View key={prayer.name} style={styles.checklistItem}>
                  <View style={styles.checklistLeft}>
                    <TouchableOpacity onPress={() => togglePrayer(prayer.name)}>
                      {prayer.completed ? (
                        <View style={styles.checkedIndicator}>
                          <CircleCheck color={colors.white} size={22} />
                        </View>
                      ) : (
                        <Circle color={colors.textSecondary} size={22} />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.checklistPrayerName}>{prayer.name}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    prayer.status === 'Completed' && styles.statusBadgeCompleted,
                    prayer.status === 'Missed' && styles.statusBadgeMissed,
                    prayer.status === 'Not Tracked' && styles.statusBadgeEmpty,
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      prayer.status === 'Completed' && styles.statusBadgeTextCompleted,
                      prayer.status === 'Missed' && styles.statusBadgeTextMissed,
                      prayer.status === 'Not Tracked' && styles.statusBadgeTextEmpty,
                    ]}>
                      {prayer.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Dynamic Stats Card */}
          <Text style={styles.sectionTitle}>This Month Summary</Text>
          <GlassCard style={styles.statsCard} intensity="dark">
            <View style={styles.statsRow}>
              <View style={styles.progressContainer}>
                <CircularProgress percentage={monthlyStats.completionRate} radius={40} strokeWidth={6} color={colors.accent} />
              </View>
              <View style={styles.statsRightGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Completed</Text>
                  <Text style={styles.statValue}>{monthlyStats.completed} Prayers</Text>
                </View>
                <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
                  <Text style={styles.statLabel}>Pending (Qaza)</Text>
                  <Text style={[styles.statValue, { color: colors.warning }]}>{monthlyStats.pending} missed</Text>
                </View>
                <View style={[styles.statItem, { marginTop: 20 }]}>
                  <Text style={styles.statLabel}>Days Tracked</Text>
                  <Text style={styles.statValue}>{monthlyStats.trackedDays} Days</Text>
                </View>
                <View style={[styles.statItem, { alignItems: 'flex-end', marginTop: 20 }]}>
                  <Text style={styles.statLabel}>Total Logs</Text>
                  <Text style={styles.statValue}>{monthlyStats.totalPrayers} entries</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Chart Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Completion Average</Text>
            <GlassCard style={styles.chartCard} intensity="dark">
              <View style={styles.chartWrapper}>
                <BarChart
                  data={barData}
                  barWidth={20}
                  spacing={30}
                  roundedTop
                  roundedBottom
                  xAxisThickness={0}
                  yAxisThickness={0}
                  yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10, fontFamily: typography.fonts.regular }}
                  xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, fontFamily: typography.fonts.regular }}
                  noOfSections={4}
                  maxValue={100}
                  frontColor={colors.primary}
                  hideRules
                  height={150}
                  width={280}
                  formatYLabel={(val) => `${val}%`}
                />
              </View>
            </GlassCard>
          </View>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  iconButton: {
    padding: 8,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  subSectionTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  calendarScroll: {
    marginBottom: 25,
  },
  calendarContainer: {
    gap: 10,
    paddingRight: 20,
  },
  calendarDayButton: {
    width: 60,
    height: 80,
    borderRadius: 16,
    backgroundColor: `${colors.card}33`,
    borderWidth: 1,
    borderColor: `${colors.highlight}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayButtonActive: {
    backgroundColor: colors.card,
    borderColor: colors.accent,
  },
  calendarDayName: {
    fontFamily: typography.fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  calendarDayNumber: {
    fontFamily: typography.fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 6,
  },
  calendarDayTextActive: {
    color: colors.text,
  },
  calendarDayIndicatorActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
  },
  calendarDayIndicatorCompleted: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  calendarDayIndicatorEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  checklistCard: {
    backgroundColor: '#0F38194D',
    padding: 20,
    borderRadius: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: `${colors.highlight}15`,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.textSecondary}22`,
    paddingBottom: 12,
  },
  checklistTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  checklistSubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: 11,
    color: colors.accent,
  },
  checklistList: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checklistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkedIndicator: {
    backgroundColor: colors.primary,
    borderRadius: 11,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistPrayerName: {
    fontFamily: typography.fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeCompleted: {
    backgroundColor: `${colors.primary}22`,
  },
  statusBadgeMissed: {
    backgroundColor: `${colors.danger}22`,
  },
  statusBadgeEmpty: {
    backgroundColor: `${colors.textSecondary}11`,
  },
  statusBadgeText: {
    fontFamily: typography.fonts.medium,
    fontSize: 10,
  },
  statusBadgeTextCompleted: {
    color: colors.accent,
  },
  statusBadgeTextMissed: {
    color: colors.danger,
  },
  statusBadgeTextEmpty: {
    color: colors.textSecondary,
  },
  statsCard: {
    backgroundColor: '#0A1C0E',
    padding: 20,
    marginBottom: 30,
    borderWidth: 0,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    marginRight: 20,
  },
  statsRightGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '45%',
  },
  statLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#0A1C0E',
    padding: 20,
    paddingBottom: 10,
    borderWidth: 0,
    alignItems: 'center',
  },
  chartWrapper: {
    marginLeft: -10,
  },
});
