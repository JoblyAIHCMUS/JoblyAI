import { Stack } from 'expo-router';

import { MyApplicationsScreen } from './components/MyApplicationsScreen';

export default function CandidateDashboard() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MyApplicationsScreen />
    </>
  );
}
                      />
                    ) : (
                      <Text className="text-xs font-bold text-[#4640de]">
                        {companyInitials}
                      </Text>
                    )}
                  </View>

                  <View className="flex-1 gap-1">
                    <Text
                      className="text-base font-semibold leading-5 text-[#25324b]"
                      numberOfLines={2}
                    >
                      {application.job.title}
                    </Text>

                    <View className="flex-row flex-wrap items-center gap-3">
                      <View className="flex-row items-center gap-1.5">
                        <Building2 size={13} color="#7c8493" />
                        <Text className="text-xs text-[#7c8493]">
                          {companyName}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-1.5">
                        <MapPin size={13} color="#7c8493" />
                        <Text className="text-xs text-[#7c8493]">
                          {location}
                        </Text>
                      </View>

                      {createdAt && (
                        <View className="flex-row items-center gap-1.5">
                          <Clock3 size={13} color="#7c8493" />
                          <Text className="text-xs text-[#7c8493]">
                            {formatShortDate(createdAt)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: `${statusColor}14` }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: statusColor }}
                    >
                      {getStatusLabel(application.status)}
                    </Text>
                  </View>
                </View>

                <Text className="mt-3 text-xs text-[#7c8493]">
                  {formatJobType(application.job.type)} job
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="mt-6 min-h-28 rounded-lg bg-[#f8fafc] px-4 py-8">
          <Text className="text-center text-sm text-[#7c8493]">
            No applications found for this filter.
          </Text>
        </View>
      )}
    </View>
  );
}

export default function CandidateDashboard() {
  const { data: user, isPending: isSessionPending } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentWeekRange = useMemo(() => getCurrentWeekRange(), []);
  const greeting = getGreeting();
  const firstName = getGreetingName(user);
  const dateRangeLabel = currentWeekRange.label;
  const {
    data: applicationsResult,
    fetchApplications,
    loading: applicationsLoading,
    error: applicationsError,
  } = useListCandidateApplications();

  const allApplications = useMemo(
    () => applicationsResult?.applications ?? [],
    [applicationsResult]
  );
  const currentRangeApplications = useMemo(
    () =>
      allApplications.filter((application) =>
        isWithinDateRange(
          application.createdAt,
          currentWeekRange.start,
          currentWeekRange.end
        )
      ),
    [allApplications, currentWeekRange.end, currentWeekRange.start]
  );

  const recentApplications = useMemo(
    () =>
      [...currentRangeApplications]
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
        )
        .slice(0, 6),
    [currentRangeApplications]
  );

  const totalApplied = currentRangeApplications.length;
  const interviewedCount = useMemo(
    () =>
      currentRangeApplications.filter((application) =>
        ['INTERVIEW', 'OFFER', 'REJECTED'].includes(application.status)
      ).length,
    [currentRangeApplications]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await fetchApplications({ pageSize: 100 });
    } finally {
      setRefreshing(false);
    }
  }, [fetchApplications]);

  useEffect(() => {
    if (
      isSessionPending ||
      !user ||
      applicationsLoading ||
      applicationsResult
    ) {
      return;
    }

    void fetchApplications({ pageSize: 100 });
  }, [
    applicationsLoading,
    applicationsResult,
    fetchApplications,
    isSessionPending,
    user,
  ]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#f9fbff]"
      edges={['top', 'left', 'right']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View className="border-b border-[#d6ddeb] bg-white px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            className="p-2"
            onPress={() => setIsSidebarOpen(true)}
          >
            <Menu size={22} color="#25324b" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-[#25324b]">Dashboard</Text>

          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#eef0ff]">
              <Text className="text-sm font-bold text-[#4640de]">
                {(firstName || 'U').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View className="relative p-2">
              <Bell size={22} color="#25324b" />
              <View className="absolute right-1 top-1 h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b5a] px-1">
                <Text className="text-xs font-bold leading-3 text-white">
                  9
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-4 px-4 py-4">
          <View>
            <Text className="text-3xl font-bold leading-8 text-[#25324b]">
              {greeting}, {firstName}
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#7c8493]">
              Here is what's happening with your job search applications from{' '}
              {dateRangeLabel}.
            </Text>
            {applicationsError ? (
              <Text className="mt-3 text-sm text-[#d93025]">
                Unable to sync applications right now.
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-between rounded-lg border border-[#d6ddeb] bg-white px-3 py-3"
          >
            <Text className="text-sm font-medium text-[#25324b]">
              {dateRangeLabel}
            </Text>
            <CalendarDays size={18} color="#4640de" />
          </TouchableOpacity>

          <StatCard
            label="Total Jobs Applied"
            value={totalApplied}
            loading={applicationsLoading && totalApplied === 0}
            icon={<FileText size={48} color="#26a4ff" strokeWidth={1.4} />}
          />

          <StatCard
            label="Interviewed"
            value={interviewedCount}
            loading={applicationsLoading && interviewedCount === 0}
            icon={
              <MessageCircleQuestion
                size={48}
                color="#26a4ff"
                strokeWidth={1.4}
              />
            }
          />

          <StatusChartsSection
            applications={currentRangeApplications}
            loading={applicationsLoading && allApplications.length === 0}
            onViewAllPress={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          />

          <RecentApplicationsSection
            applications={recentApplications}
            loading={applicationsLoading && allApplications.length === 0}
            error={applicationsError}
          />
        </View>
      </ScrollView>

      <CandidateDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPath="/pages/candidate/dashboard"
      />
    </SafeAreaView>
  );
}
