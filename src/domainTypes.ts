import type { CursorPage, QueryParams, UnknownRecord } from "./core/types.ts";

export type AnyData = UnknownRecord;
/** Use a concrete request body type or MultipartImageBody. */
export type AnyBody = UnknownRecord | FormData;
/** Use an endpoint-specific query type such as PlotListQuery or RoomListQuery. */
export type AnyQuery = QueryParams;
export type IsoDateString = string;
export type Nullable<T> = T | null;
export type SortOrder = "ASC" | "DESC" | string;

export type CursorListQuery = QueryParams & {
  limit?: number;
  cursor?: string;
  sort?: string;
  order?: SortOrder;
};

export type OffsetListQuery = QueryParams & {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string;
  order?: SortOrder;
};

export type LocaleQuery = QueryParams & {
  language?: string;
  locale?: string;
  country?: string;
};

export type PlatformQuery = QueryParams & {
  platform?: "IOS" | "ANDROID" | "WEB" | string;
  storeType?: string;
};

export type IdQuery = QueryParams & {
  id?: string;
};

export type PlotListQuery = CursorListQuery & LocaleQuery & {
  genre?: string;
  genreKey?: string;
  hashtag?: string;
  topicId?: string;
  rankingType?: string;
  onlyPublic?: boolean;
  includePrivate?: boolean;
};

export type PlotSearchQuery = PlotListQuery & {
  query?: string;
  q?: string;
  keyword?: string;
  hashtags?: string[];
};

export type LayoutQuery = LocaleQuery & PlatformQuery & {
  placement?: string;
  sectionId?: string;
};

export type AnnouncementQuery = CursorListQuery & LocaleQuery & {
  category?: string;
};

export type NotificationQuery = CursorListQuery & {
  unreadOnly?: boolean;
};

export type RoomListQuery = CursorListQuery & {
  plotId?: string;
  saved?: boolean;
  pinned?: boolean;
};

export type MessageListQuery = CursorListQuery & {
  beforeMessageId?: string;
  afterMessageId?: string;
};

export type CandidateListQuery = CursorListQuery & {
  selected?: boolean;
};

export type ChatProfileListQuery = CursorListQuery & {
  plotId?: string;
  selected?: boolean;
};

export type UserListQuery = CursorListQuery & {
  username?: string;
  keyword?: string;
};

export type CreatorDashboardQuery = QueryParams & {
  period?: "DAILY" | "WEEKLY" | "MONTHLY" | string;
  from?: IsoDateString;
  to?: IsoDateString;
};

export type CoinTransactionQuery = CursorListQuery & {
  type?: string;
  from?: IsoDateString;
  to?: IsoDateString;
};

export type StoreProductQuery = PlatformQuery & LocaleQuery & {
  productType?: string;
};

export type EligibilityQuery = PlatformQuery & {
  productId?: string;
  subscriptionId?: string;
};

export type WebOrderListQuery = CursorListQuery & {
  status?: string;
};

export type LorebookListQuery = CursorListQuery & LocaleQuery & {
  query?: string;
  q?: string;
  keyword?: string;
  creatorId?: string;
  plotId?: string;
};

export type FeatureDiscoveryQuery = PlotListQuery & {
  source?: string;
};

export type ImageHistoryQuery = CursorListQuery & {
  status?: string;
};

export type ProfileImageTagQuery = LocaleQuery & {
  keyword?: string;
};

export type AppExperimentQuery = QueryParams & {
  userId?: string;
  deviceId?: string;
};

export type ChatModelConfigQuery = PlatformQuery & {
  plotId?: string;
  roomId?: string;
};

export type CreatorAssistantVibeQuery = LocaleQuery & {
  style?: string;
};

export type ReportRequest = AnyData & {
  category?: string;
  categoryId?: string;
  reason?: string;
  comment?: string;
  content?: string;
};

export type EmptyRequest = Record<string, never>;

export type MultipartImageBody = FormData;

export type User = AnyData & {
  id?: string | number;
  name?: string;
  email?: string | null;
  username?: string;
  nickname?: string;
  profileImageUrl?: string | null;
  description?: string | null;
  gender?: string | null;
  isActive?: boolean;
};

export type Character = AnyData & {
  id?: string;
  name?: string;
  description?: string;
  imageUrl?: string | null;
};

export type TalkSpeakerProfile = AnyData & {
  id?: string;
  name: string;
  imageUrl?: string | null;
  source?: "character" | "chatProfile" | "plot" | string;
};

export type ChatProfile = AnyData & {
  id?: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  isDefault?: boolean;
  selected?: boolean;
};

export type Plot = AnyData & {
  id?: string;
  plotId?: string;
  title?: string;
  name?: string;
  initialRoomImageUrl?: string | null;
  imageUrl?: string | null;
  isProfileImageDeletedByAbusing?: boolean;
  hashtags?: string[];
  characters?: Character[];
  chatProfiles?: ChatProfile[];
  conversations?: unknown[];
  intros?: unknown[];
  firstCharacterName?: string;
  shortDescription?: string;
  longDescription?: string;
  description?: string;
  creator?: User;
  creatorComment?: string | null;
  comment?: string | null;
  lorebooks?: Lorebook[];
  plots?: Plot[];
  interactionCount?: number;
  interactionCountWithRegen?: number;
  verified?: boolean;
  supportedFeatures?: string[];
  createdAt?: IsoDateString | Date;
  releasedAt?: IsoDateString | Date;
  updatedAt?: IsoDateString | Date;
  infoBoxSetting?: unknown;
  cyoaSetting?: unknown;
};

export type Room = AnyData & {
  id?: string;
  roomId?: string;
  plotId?: string;
  plot?: Plot;
  lastMessage?: Message;
  createdAt?: IsoDateString | Date;
  updatedAt?: IsoDateString | Date;
  savedAt?: IsoDateString | Date | null;
  pinnedAt?: IsoDateString | Date | null;
};

export type Message = AnyData & {
  id?: string;
  messageId?: string;
  roomId?: string;
  sender?: string;
  role?: string;
  type?: string;
  content?: string;
  text?: string;
  contents?: MessageContent[];
  voice?: unknown;
  edited?: boolean;
  candidateId?: string | null;
  messageTime?: IsoDateString | Date;
  voicePrice?: number | null;
  isIntro?: boolean;
  createdAt?: IsoDateString | Date;
  updatedAt?: IsoDateString | Date;
};

export type MessageContent = AnyData & {
  type?: string;
  text?: string;
  speakerName?: string;
  position?: string;
};

export type ChatTextRequest = AnyData & {
  type: "TEXT";
  text: string;
};

export type ChatCyoaRequest = AnyData & {
  type: "CYOA";
  optionId?: string;
  text?: string;
};

export type ChatSendMessageRequest = ChatTextRequest | ChatCyoaRequest | AnyData;

export type ChatStreamEventName =
  | "IN_PROGRESS"
  | "CHAT_COMPLETE"
  | "CANDIDATE_COMPLETE"
  | "EXAMPLE_CHAT_COMPLETE"
  | "CHAT_OPTION_COMPLETE"
  | "RECOMMENDED_MESSAGE_COMPLETE"
  | "DETECT_ABUSING"
  | "ERROR"
  | string;

export type ChatStreamChunkMessage = AnyData & {
  contents?: MessageContent[];
};

export type ChatStreamEvent = AnyData & {
  event?: ChatStreamEventName;
  chunkMessage?: ChatStreamChunkMessage;
  requestMessage?: Message;
  replyMessage?: Message;
  candidate?: AnyData;
  replyOption?: AnyData;
  shouldNudgeSlowChat?: boolean;
  shouldGenerateConsecutive?: boolean;
  shouldRequestFeedback?: boolean;
  feedbackPredefinedComments?: unknown[];
  index?: number | null;
  message?: string;
};

export type Lorebook = AnyData & {
  id?: string;
  title?: string;
  description?: string;
  contents?: unknown;
  creator?: User;
  createdAt?: IsoDateString | Date;
  updatedAt?: IsoDateString | Date;
};

export type RoomCreateRequest = AnyData & {
  plotId: string;
  chatProfileId?: string;
  userChatProfileId?: string;
  title?: string | null;
};

export type RoomUpdateRequest = AnyData & {
  title?: string | null;
};

export type RoomCloneRequest = AnyData & {
  title?: string | null;
};

export type RoomPurgeRequest = AnyData & {
  plotId?: string;
  roomIds?: string[];
};

export type ActiveRoomIdQuery = QueryParams & {
  plotId?: string;
};

export type MessageUpdateRequest = AnyData & {
  contents?: MessageContent[];
  content?: string;
  text?: string;
};

export type DeleteRoomMessagesRequest = AnyData & {
  messageIds?: string[];
  beforeMessageId?: string;
};

export type Candidate = AnyData & {
  id?: string;
  candidateId?: string;
  contents?: MessageContent[];
  selected?: boolean;
};

export type CandidateListResponse = CursorList<Candidate, "candidates">;

export type CandidateUpdateRequest = AnyData & {
  selected?: boolean;
};

export type CandidateFeedbackRequest = AnyData & {
  feedback?: string;
  comment?: string;
  rating?: number;
  predefinedCommentId?: string;
};

export type ChatOptionsStreamRequest = AnyData & {
  messageId?: string;
  optionIds?: string[];
};

export type ChatOptionSelectRequest = AnyData & {
  text?: string;
  optionId?: string;
};

export type ModelSetting = AnyData & {
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type SavedRoomStatusResponse = AnyData & {
  saved?: boolean;
  savedRoomId?: string | null;
};

export type RoomSaveRequest = AnyData & {
  title?: string | null;
};

export type RoomLoadRequest = AnyData & {
  savedRoomId?: string;
};

export type RoomBookmark = AnyData & {
  id?: string;
  roomId?: string;
  messageId?: string;
  title?: string | null;
  createdAt?: IsoDateString;
  updatedAt?: IsoDateString;
};

export type RoomBookmarkListResponse = CursorList<RoomBookmark, "bookmarks">;

export type RoomBookmarkUsageResponse = AnyData & {
  used?: number;
  limit?: number;
  count?: number;
};

export type RoomIntroBeforeSelectionResponse = AnyData & {
  intro?: Message | null;
  intros?: Message[];
};

export type RoomIntroResponse = AnyData & {
  intro?: Message | null;
  intros?: Message[];
  message?: Message | null;
};

export type SnapshotImageReactionRequest = AnyData & {
  rating?: number;
  opinion?: string;
  reason?: string;
};

export type RoomRecommendedMessagesRequest = AnyData & {
  count?: number;
  messageId?: string;
};

export type UserPlotChatProfile = ChatProfile & {
  plotId?: string;
  characterIds?: string[];
  selectedCharacterIds?: string[];
};

export type UserPlotChatProfileListResponse = CursorList<UserPlotChatProfile, "userPlotChatProfiles">;

export type UserPlotChatProfileDraftRequest = AnyData & {
  name?: string;
  description?: string | null;
  characterIds?: string[];
  selectedCharacterIds?: string[];
  imageUrl?: string | null;
};

export type PlotDraftRequest = AnyData & {
  name?: string;
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  description?: string;
  characters?: Character[];
  chatProfiles?: ChatProfile[];
  conversations?: unknown[];
  intros?: unknown[];
  about?: unknown;
  isPrivate?: boolean;
  status?: string;
  lorebookIds?: string[];
  infoBoxSetting?: unknown;
  cyoaSetting?: unknown;
};

export type PlotStatusRequest = AnyData & {
  status: string;
};

export type PlotPrivateRequest = AnyData & {
  isPrivate: boolean;
};

export type PlotUnlimitedRequest = AnyData & {
  unlimited?: boolean;
};

export type PlotNameCheckQuery = QueryParams & {
  name: string;
};

export type PlotBlockRequest = AnyData & {
  plotId: string;
};

export type HashtagBlockRequest = AnyData & {
  hashtag: string;
};

export type PlotRecommendedMessagesRequest = AnyData & {
  count?: number;
};

export type PlotLikeRequest = AnyData & {
  source?: string;
};

export type PlotImage = AnyData & {
  id?: string;
  imageUrl?: string | null;
  sequence?: number;
  caption?: string | null;
};

export type PlotImageListResponse = AnyData & {
  images?: PlotImage[];
  aboutImages?: PlotImage[];
  introImages?: PlotImage[];
};

export type AppendPlotImagesRequest = AnyData & {
  imageUrls?: string[];
  images?: Array<{
    imageUrl?: string;
    caption?: string | null;
    sequence?: number;
  }>;
};

export type LinkLorebookRequest = AnyData & {
  enabled?: boolean;
  order?: number;
};

export type ExampleChatResponse = AnyData & {
  messages?: Message[];
};

export type SelectedPlayerCharacterResponse = AnyData & {
  character?: Character | null;
  characterId?: string | null;
};

export type PlotProfileImageGenerationJob = AnyData & {
  id?: string;
  jobId?: string;
  status?: string;
  imageUrl?: string | null;
  resultId?: string;
};

export type PlotProfileImageGenerationResult = AnyData & {
  id?: string;
  profileImageResultId?: string;
  imageUrl?: string | null;
  tags?: string[];
  status?: string;
};

export type SaveProfileImageResultRequest = AnyData & {
  plotId?: string;
};

export type RegisterProfileImageJobRequest = AnyData & {
  prompt?: string;
  tags?: string[];
  style?: string;
};

export type PlotProfileImageHistoryResponse = CursorList<PlotProfileImageGenerationResult, "results">;

export type PlotProfileImageSavedResultListResponse = CursorList<PlotProfileImageGenerationResult, "profileImageResults">;

export type ProfileImageTagResponse = AnyData & {
  tags?: string[];
  translatedTags?: string[];
};

export type ExtractProfileImageTagsRequest = AnyData & {
  prompt?: string;
  imageUrl?: string;
};

export type TranslateProfileImageTagsRequest = AnyData & {
  tags?: string[];
  sourceLanguage?: string;
  targetLanguage?: string;
};

export type ImageCreatorRequest = AnyData & {
  prompt?: string;
  style?: string;
  seed?: number;
};

export type ImageCropRequest = AnyData & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type ImageRatingRequest = AnyData & {
  rating?: number;
  reason?: string;
};

export type PlotCountResponse = AnyData & {
  count?: number;
  plotCount?: number;
};

export type RecommendedMessagesQuotaResponse = AnyData & {
  quota?: number;
  remaining?: number;
  resetAt?: IsoDateString;
};

export type LorebookDraftRequest = AnyData & {
  title?: string;
  description?: string;
  contents?: unknown;
  isPrivate?: boolean;
  visibility?: string;
};

export type LorebookCheckContentsRequest = AnyData & {
  contents?: unknown;
};

export type LorebookTitleCheckQuery = QueryParams & {
  title: string;
};

export type ProfileUpdateRequest = AnyData & {
  name?: string;
  nickname?: string;
  username?: string;
  description?: string | null;
  gender?: string | null;
};

export type UserBlockRequest = AnyData & {
  userId: string;
};

export type ChatProfileDraftRequest = AnyData & {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
};

export type ChatProfileAbusingCheckRequest = ChatProfileDraftRequest;

export type PreferredGenresRequest = AnyData & {
  genreKeys?: string[];
  genres?: string[];
};

export type CreatorFollowNotificationRequest = AnyData & {
  enabled?: boolean;
  notificationEnabled?: boolean;
};

export type Announcement = AnyData & {
  id?: string | number;
  title?: string;
  body?: string;
  content?: string;
  publishedAt?: IsoDateString;
  createdAt?: IsoDateString;
  updatedAt?: IsoDateString;
};

export type CoinBalance = AnyData & {
  balance?: number;
  amount?: number;
  freeAmount?: number;
  paidAmount?: number;
  expiringAmount?: number;
};

export type CursorList<T, TKey extends string> = AnyData & {
  nextCursor?: string | null;
} & {
  [K in TKey]: T[];
};

export type Page<T = unknown> = CursorPage<T> | T[];

export type RecommendMetadata = AnyData & {
  nominatorName?: string | null;
  successPlotName?: string | null;
  successPlotId?: string | null;
  overlappedHashtags?: string[] | null;
  rankingAlgorithm?: string | null;
  genreKey?: string | null;
  genreDisplayName?: string | null;
  rank?: number | null;
};

export type InfinitePlotsResponse = CursorList<Plot, "plots"> & {
  requestId?: string;
  recommendMetadataByPlotId?: Record<string, RecommendMetadata>;
};

export type AnnouncementListResponse = CursorList<Announcement, "announcements">;

export type SupportAnnouncementListResponse = CursorList<Announcement, "supportAnnouncements">;

export type AnnouncementBannerResponse = AnyData & {
  announcement?: Announcement | null;
};

export type RoomListResponse = CursorList<Room, "rooms">;

export type MessageListResponse = CursorList<Message, "messages">;

export type LorebookListResponse = CursorList<Lorebook, "lorebooks">;

export type PlotListResponse = CursorList<Plot, "plots">;

export type UserListResponse = CursorList<User, "users">;

export type FeatureFlag = AnyData & {
  enabled?: boolean;
  key?: string;
  value?: boolean | string | number | null;
};

export type ConnectedExternalPlatformsResponse = AnyData & {
  connectedExternalPlatforms?: Array<AnyData & {
    issuer?: string;
    connectedAt?: IsoDateString;
  }>;
};

export type LogoutRequest = AnyData & {
  reason?: string;
};

export type SsoCodeRequest = AnyData & {
  redirectUri?: string;
  provider?: string;
};

export type LayoutSection = AnyData & {
  id?: string | number;
  type?: string;
  title?: string;
  items?: unknown[];
};

export type LayoutResponse = AnyData & {
  id?: string | number;
  requestId?: string;
  sections?: LayoutSection[];
  updatedAt?: IsoDateString;
};

export type LayoutSectionResponse = LayoutSection;

export type Banner = AnyData & {
  id?: string | number;
  title?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  startsAt?: IsoDateString;
  endsAt?: IsoDateString;
};

export type BannerListResponse = AnyData & {
  banners?: Banner[];
};

export type Popup = AnyData & {
  id?: string | number;
  title?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
};

export type PopupListResponse = AnyData & {
  popups?: Popup[];
};

export type AbExperiment = AnyData & {
  id?: string;
  experimentId?: string;
  key?: string;
  variant?: string | null;
};

export type AppPushTokenRequest = AnyData & {
  token?: string;
  deviceId?: string;
  platform?: string;
};

export type AppPushSetting = AnyData & {
  pushType?: string;
  enabled?: boolean;
};

export type NotificationItem = AnyData & {
  id?: string;
  notificationId?: string;
  title?: string;
  body?: string;
  readAt?: IsoDateString | null;
  createdAt?: IsoDateString;
  updatedAt?: IsoDateString;
};

export type NotificationListResponse = CursorList<NotificationItem, "notifications">;

export type LatestUpdatedAtResponse = AnyData & {
  latestUpdatedAt?: IsoDateString | null;
  updatedAt?: IsoDateString | null;
};

export type DailyQuiz = AnyData & {
  id?: string;
  quizId?: string;
  title?: string;
  selections?: unknown[];
};

export type DailyQuizRewardResponse = AnyData & {
  claimed?: boolean;
  rewardAmount?: number;
};

export type DailyQuizWinnersResponse = CursorList<User, "winners">;

export type DailyQuizSelectionRequest = AnyData & {
  selectionId?: string;
  answer?: string;
};

export type ChatMessageReportCategory = AnyData & {
  id?: string;
  name?: string;
  reason?: string;
};

export type ChatMessageReportCategoriesResponse = AnyData & {
  categories?: ChatMessageReportCategory[];
};

export type ChatModelConfig = AnyData & {
  id?: string;
  model?: string;
  enabled?: boolean;
};

export type ChatModelConfigsResponse = AnyData & {
  configs?: ChatModelConfig[];
  chatModelConfigs?: ChatModelConfig[];
};

export type NuttyTokenVerificationRequest = AnyData & {
  token?: string;
  phoneNumber?: string;
  code?: string;
};

export type NuttyMigrationRequest = AnyData & {
  token?: string;
  phoneNumber?: string;
};

export type NuttyUser = User & {
  phoneNumber?: string | null;
};

export type WithdrawalRequest = AnyData & {
  reason?: string;
  comment?: string;
};

export type WithdrawalWarningResponse = AnyData & {
  shouldWarn?: boolean;
  message?: string;
};

export type CreatorAssistantGenerateRequest = AnyData & {
  prompt?: string;
  plotId?: string;
  characterId?: string;
  style?: string;
};

export type CreatorAssistantGeneratedTextResponse = AnyData & {
  text?: string;
  backstories?: string[];
  characters?: Character[];
  situation?: string;
};

export type CreatorAssistantGeneratedImageResponse = AnyData & {
  imageUrl?: string;
  jobId?: string;
  status?: string;
};

export type CreatorAssistantQuotaResponse = AnyData & {
  quota?: number;
  remaining?: number;
};

export type CreatorAssistantVibesResponse = AnyData & {
  vibes?: string[];
  styles?: string[];
};

export type NiceAdditionalAuthValidateRequest = AnyData & {
  token?: string;
  requestId?: string;
  password?: string;
};

export type NiceAdditionalAuthValidateResponse = AnyData & {
  valid?: boolean;
  verified?: boolean;
  token?: string;
};

export type StoreProduct = AnyData & {
  id: string;
  type?: string;
  name?: string;
  displayName?: string;
  amount?: number;
  bonusAmount?: number;
  price?: number;
  discountedPrice?: number;
  currency?: string;
  nextBillingDate?: IsoDateString;
};

export type StoreProductsResponse = AnyData & {
  products: StoreProduct[];
};

export type StorePurchaseResponse = AnyData & {
  id?: string;
  orderId?: string;
  purchaseId?: string;
  status?: string;
};

export type CoinProduct = StoreProduct & {
  productId?: string;
};

export type CoinProductsResponse = AnyData & {
  products?: CoinProduct[];
  coinProducts?: CoinProduct[];
};

export type CoinTransaction = AnyData & {
  id?: string;
  transactionId?: string;
  amount?: number;
  type?: string;
  reason?: string;
  createdAt?: IsoDateString;
};

export type CoinTransactionsResponse = CursorList<CoinTransaction, "transactions">;

export type CoinDepositDetail = AnyData & {
  id?: string;
  transactionId?: string;
  amount?: number;
  status?: string;
  createdAt?: IsoDateString;
};

export type CoinExpiration = AnyData & {
  id?: string;
  amount?: number;
  expiresAt?: IsoDateString;
};

export type CoinExpirationsResponse = CursorList<CoinExpiration, "expirations">;

export type CoinDailyRewardResponse = AnyData & {
  amount?: number;
  claimed?: boolean;
  leftAttempts?: number;
};

export type AttemptsResponse = AnyData & {
  leftAttempts?: number;
  attempts?: number;
};

export type AmountResponse = AnyData & {
  amount?: number;
};

export type PaymentMethodResponse = AnyData & {
  id?: string;
  type?: string;
  brandpayCards?: unknown[];
};

export type ZetaPassSubscription = AnyData & {
  status?: string;
  active?: boolean;
  startedAt?: IsoDateString;
  expiresAt?: IsoDateString;
  nextBillingDate?: IsoDateString;
  canceledAt?: IsoDateString | null;
};

export type ZetaPassPaymentMethod = AnyData & {
  brandpayCards?: unknown[];
  brandpayIconImageUrl?: string;
  paymentMethod?: string;
};

export type ZetaPassRefundResult = AnyData & {
  refunded?: boolean;
  status?: string;
};

export type ZetaPassEligibilityResponse = AnyData & {
  eligible?: boolean;
  reason?: string;
};

export type ZetaPassProConversionStatus = AnyData & {
  status?: string;
  convertible?: boolean;
};

export type ZetaPassProConversionPreview = AnyData & {
  preview?: unknown;
};

export type ZetaPassPaymentMethodRequest = AnyData & {
  paymentMethodId?: string;
  brandpayCardId?: string;
  paymentMethod?: string;
};

export type ZetaPassBrandpaySubscribeRequest = AnyData & {
  brandpayCardId?: string;
  promotionId?: string;
};

export type ZetaPassStoreSubscribeRequest = AnyData & {
  productId?: string;
  purchaseToken?: string;
  transactionId?: string;
  receipt?: string;
};

export type ZetaPassCancelRequest = AnyData & {
  reason?: string;
  comment?: string;
};

export type ZetaPassRefundRequest = AnyData & {
  reason?: string;
  comment?: string;
};

export type ZetaPassWebOrderRequest = AnyData & {
  productId?: string;
  paymentMethod?: string;
  successUrl?: string;
  failUrl?: string;
};

export type ZetaPassWebOrder = AnyData & {
  id?: string;
  orderId?: string;
  status?: string;
  productId?: string;
};

export type ZetaPassWebOrdersResponse = CursorList<ZetaPassWebOrder, "orders">;

export type ZetaPassOneDayPassPurchaseRequest = ZetaPassStoreSubscribeRequest | ZetaPassWebOrderRequest;

export type ZetaPassOneDayPassConfirmationRequest = AnyData & {
  orderId?: string;
  paymentKey?: string;
  amount?: number;
};

export type SubscriptionStatusResponse = AnyData & {
  status?: string;
  active?: boolean;
};

export type SubscriptionEntitlementsResponse = AnyData & {
  entitlements?: unknown[];
};

export type SubscriptionBindUserRequest = AnyData & {
  appUserId?: string;
  originalAppUserId?: string;
};

export type TossPaymentOrderRequest = AnyData & {
  productId?: string;
  amount?: number;
  orderName?: string;
  successUrl?: string;
  failUrl?: string;
};

export type TossPaymentConfirmationRequest = AnyData & {
  paymentKey?: string;
  orderId?: string;
  amount?: number;
};

export type TossPaymentCancellationRequest = AnyData & {
  paymentKey?: string;
  cancelReason?: string;
};

export type TossPaymentMethodsResponse = AnyData & {
  paymentMethods?: unknown[];
};

export type TossPaymentOrderResponse = AnyData & {
  orderId?: string;
  status?: string;
};

export type CoinDailyRewardRequest = AnyData & {
  source?: string;
};

export type CoinAutoPaymentSettings = AnyData & {
  enabled?: boolean;
  productId?: string;
  paymentMethodId?: string;
};

export type CoinPurchaseRequest = AnyData & {
  purchaseToken?: string;
  purchaseTokenAndroid?: string;
  appAccountToken?: string;
  offerToken?: string;
  offerTokenAndroid?: string;
  externalPurchaseToken?: string;
  transactionId?: string;
  receipt?: string;
  paymentMethodId?: string;
};

export type IdResponse = AnyData & {
  id?: string;
  roomId?: string;
  plotId?: string;
};

export type PlotLikeState = AnyData & {
  isLiked?: boolean;
  liked?: boolean;
  count?: number;
};

export type BlockedPlotsResponse = CursorList<Plot, "blockedPlots">;

export type RecentPreReleasePlotResponse = AnyData & {
  recentPlot?: Plot | null;
  preReleasePlotCount?: number;
};

export type PlotNameCheckResponse = AnyData & {
  warnKeywords?: string[];
};

export type RecommendedPlaceholderResponse = AnyData & {
  recommendedQueryList?: string[];
};

export type RecommendedKeywordsResponse = AnyData & {
  keywords?: string[];
};

export type RelatedKeywordsResponse = AnyData & {
  relatedKeywords?: string[];
};

export type KeywordTestResponse = AnyData & {
  keyword?: string;
  valid?: boolean;
  result?: string;
};

export type PlotSummary = AnyData & {
  plotId?: string;
  summary?: string;
};

export type LorebookPlotStats = AnyData & {
  plotCount?: number;
  connectedPlotCount?: number;
};

export type CreatorDashboardPlotStats = AnyData & {
  plotId?: string;
  interactionCount?: number;
  messageCount?: number;
  likeCount?: number;
};

export type SpecialCuration = AnyData & {
  id?: string;
  key?: string;
  title?: string;
  plots?: Plot[];
};
