// Generated from exported enum constants in the saved Zeta 3.51.94 Android DTO module.
export const ABRequestableFeature = {
  "Webview": "WEBVIEW",
  "TranslatedEditionMark": "TRANSLATED_EDITION_MARK",
  "PluginIntroHidden": "PLUGIN_INTRO_HIDDEN"
} as const;
export type ABRequestableFeature = typeof ABRequestableFeature[keyof typeof ABRequestableFeature];

export const AndroidAgeRangeSource = {
  "TierA": "TIER_A",
  "TierB": "TIER_B",
  "TierC": "TIER_C",
  "TierD": "TIER_D",
  "Unrecognized": "UNRECOGNIZED"
} as const;
export type AndroidAgeRangeSource = typeof AndroidAgeRangeSource[keyof typeof AndroidAgeRangeSource];

export const AndroidAgeSignalsStatus = {
  "Shared": "SHARED",
  "NotShared": "NOT_SHARED",
  "VerificationRequired": "VERIFICATION_REQUIRED",
  "Unrecognized": "UNRECOGNIZED"
} as const;
export type AndroidAgeSignalsStatus = typeof AndroidAgeSignalsStatus[keyof typeof AndroidAgeSignalsStatus];

export const AndroidSignificantChangeStatus = {
  "Approved": "APPROVED",
  "Pending": "PENDING",
  "Declined": "DECLINED",
  "Unrecognized": "UNRECOGNIZED"
} as const;
export type AndroidSignificantChangeStatus = typeof AndroidSignificantChangeStatus[keyof typeof AndroidSignificantChangeStatus];

export const AndroidUserStatus = {
  "Verified": "VERIFIED",
  "Supervised": "SUPERVISED",
  "SupervisedApprovalPending": "SUPERVISED_APPROVAL_PENDING",
  "SupervisedApprovalDenied": "SUPERVISED_APPROVAL_DENIED",
  "Declared": "DECLARED",
  "Unknown": "UNKNOWN",
  "Unrecognized": "UNRECOGNIZED"
} as const;
export type AndroidUserStatus = typeof AndroidUserStatus[keyof typeof AndroidUserStatus];

export const AnnouncementCategory = {
  "Notice": "NOTICE",
  "Plugin": "PLUGIN"
} as const;
export type AnnouncementCategory = typeof AnnouncementCategory[keyof typeof AnnouncementCategory];

export const AutoPaymentOrderStatus = {
  "Requested": "REQUESTED",
  "Charged": "CHARGED",
  "Failed": "FAILED"
} as const;
export type AutoPaymentOrderStatus = typeof AutoPaymentOrderStatus[keyof typeof AutoPaymentOrderStatus];

export const AutoPaymentProvider = {
  "Brandpay": "BRANDPAY",
  "CodaPay": "CODA_PAY"
} as const;
export type AutoPaymentProvider = typeof AutoPaymentProvider[keyof typeof AutoPaymentProvider];

export const AutoPaymentTriggerType = {
  "Threshold": "THRESHOLD",
  "Schedule": "SCHEDULE"
} as const;
export type AutoPaymentTriggerType = typeof AutoPaymentTriggerType[keyof typeof AutoPaymentTriggerType];

export const BannerType = {
  "Home": "HOME",
  "Strip": "STRIP"
} as const;
export type BannerType = typeof BannerType[keyof typeof BannerType];

export const BlockReasonType = {
  "Copyright": "COPYRIGHT",
  "Sexual": "SEXUAL",
  "Spam": "SPAM",
  "Mixed": "MIXED",
  "CopyrightInner": "COPYRIGHT_INNER",
  "CopyrightOuter": "COPYRIGHT_OUTER",
  "Monitoring": "MONITORING",
  "Community": "COMMUNITY",
  "UserProfile": "USER_PROFILE",
  "GenerateImageAbusing": "GENERATE_IMAGE_ABUSING",
  "AutomatedByIp": "AUTOMATED_BY_IP",
  "AutomatedByDeviceId": "AUTOMATED_BY_DEVICE_ID",
  "RefundAbusing": "REFUND_ABUSING",
  "Other": "OTHER"
} as const;
export type BlockReasonType = typeof BlockReasonType[keyof typeof BlockReasonType];

export const BlockType = {
  "BlockAll": "BLOCK_ALL",
  "BlockCreatePlot": "BLOCK_CREATE_PLOT",
  "CommentShadowHide": "COMMENT_SHADOW_HIDE",
  "CommentWriteBan": "COMMENT_WRITE_BAN",
  "BlockUpdateProfile": "BLOCK_UPDATE_PROFILE"
} as const;
export type BlockType = typeof BlockType[keyof typeof BlockType];

export const BrandpayCustomerStatus = {
  "Active": "ACTIVE",
  "Removed": "REMOVED"
} as const;
export type BrandpayCustomerStatus = typeof BrandpayCustomerStatus[keyof typeof BrandpayCustomerStatus];

export const BrandpayTermsScope = {
  "Register": "REGISTER",
  "Account": "ACCOUNT",
  "Billing": "BILLING",
  "Card": "CARD"
} as const;
export type BrandpayTermsScope = typeof BrandpayTermsScope[keyof typeof BrandpayTermsScope];

export const CharacterInfoBoxItemType = {
  "Mood": "MOOD",
  "Condition": "CONDITION",
  "Outfit": "OUTFIT",
  "Pose": "POSE",
  "Goal": "GOAL",
  "Relationship": "RELATIONSHIP",
  "InnerThought": "INNER_THOUGHT",
  "Inventory": "INVENTORY"
} as const;
export type CharacterInfoBoxItemType = typeof CharacterInfoBoxItemType[keyof typeof CharacterInfoBoxItemType];

export const ChatAbusePenaltyAction = {
  "Warn": "WARN",
  "Suspend": "SUSPEND",
  "ResetRoom": "RESET_ROOM"
} as const;
export type ChatAbusePenaltyAction = typeof ChatAbusePenaltyAction[keyof typeof ChatAbusePenaltyAction];

export const ChatSnapshotImageStatus = {
  "Progress": "PROGRESS",
  "Success": "SUCCESS",
  "Failed": "FAILED",
  "Abusing": "ABUSING",
  "Deleted": "DELETED"
} as const;
export type ChatSnapshotImageStatus = typeof ChatSnapshotImageStatus[keyof typeof ChatSnapshotImageStatus];

export const ChatWithdrawalSource = {
  "Chat": "CHAT",
  "Regen": "REGEN",
  "CustomRegen": "CUSTOM_REGEN"
} as const;
export type ChatWithdrawalSource = typeof ChatWithdrawalSource[keyof typeof ChatWithdrawalSource];

export const CheckLorebookAbusingResponseField = {
  "Title": "TITLE",
  "Description": "DESCRIPTION",
  "Name": "NAME",
  "Keywords": "KEYWORDS",
  "Content": "CONTENT"
} as const;
export type CheckLorebookAbusingResponseField = typeof CheckLorebookAbusingResponseField[keyof typeof CheckLorebookAbusingResponseField];

export const CodaPayWallet = {
  "GooglePay": "GOOGLE_PAY",
  "ApplePay": "APPLE_PAY",
  "Paypal": "PAYPAL",
  "Venmo": "VENMO"
} as const;
export type CodaPayWallet = typeof CodaPayWallet[keyof typeof CodaPayWallet];

export const CoinDepositType = {
  "PurchaseRefund": "PURCHASE_REFUND",
  "SubscribeRefund": "SUBSCRIBE_REFUND",
  "OpenStorePurchase": "OPEN_STORE_PURCHASE",
  "OpenStorePurchaseBonus": "OPEN_STORE_PURCHASE_BONUS",
  "AutoPayment": "AUTO_PAYMENT",
  "AutoPaymentBonus": "AUTO_PAYMENT_BONUS",
  "PassSubscriptionBonus": "PASS_SUBSCRIPTION_BONUS",
  "ProToPassConversion": "PRO_TO_PASS_CONVERSION",
  "OfferwallReward": "OFFERWALL_REWARD",
  "Admin": "ADMIN",
  "ProDailyReward240911": "PRO_DAILY_REWARD_240911",
  "InternalTest": "INTERNAL_TEST",
  "DailyQuiz": "DAILY_QUIZ",
  "AdminReward": "ADMIN_REWARD",
  "ChristmasEvent2025": "CHRISTMAS_EVENT_2025",
  "PaybackEvent": "PAYBACK_EVENT",
  "ContestCheerEvent": "CONTEST_CHEER_EVENT",
  "RefundRequestCancelled": "REFUND_REQUEST_CANCELLED",
  "IntegratedDeposit": "INTEGRATED_DEPOSIT",
  "RedemptionCode": "REDEMPTION_CODE",
  "CreationStampEvent": "CREATION_STAMP_EVENT",
  "HalloweenEvent2026": "HALLOWEEN_EVENT_2026",
  "TrickOrTreat2026": "TRICK_OR_TREAT_2026",
  "Unknown": "UNKNOWN"
} as const;
export type CoinDepositType = typeof CoinDepositType[keyof typeof CoinDepositType];

export const CoinProductType = {
  "Pro": "PRO",
  "CharacterFacial": "CHARACTER_FACIAL",
  "CharacterVoice": "CHARACTER_VOICE",
  "SaveRoom": "SAVE_ROOM",
  "LoadRoom": "LOAD_ROOM",
  "SkipInterstitialAd": "SKIP_INTERSTITIAL_AD",
  "CharacterSkin": "CHARACTER_SKIN",
  "RecommendedMessage": "RECOMMENDED_MESSAGE",
  "CharacterProfileImageGeneration": "CHARACTER_PROFILE_IMAGE_GENERATION",
  "SnapshotImage": "SNAPSHOT_IMAGE",
  "ChatExternalModel": "CHAT_EXTERNAL_MODEL",
  "CustomRegenExternalModel": "CUSTOM_REGEN_EXTERNAL_MODEL",
  "IntegratedPurchase": "INTEGRATED_PURCHASE",
  "PluginItem": "PLUGIN_ITEM",
  "Frame4cut": "FRAME_4CUT"
} as const;
export type CoinProductType = typeof CoinProductType[keyof typeof CoinProductType];

export const CoinTransactionQueryType = {
  "All": "ALL",
  "Deposit": "DEPOSIT",
  "Withdrawal": "WITHDRAWAL"
} as const;
export type CoinTransactionQueryType = typeof CoinTransactionQueryType[keyof typeof CoinTransactionQueryType];

export const CoinWithdrawalType = {
  "Purchase": "PURCHASE",
  "Subscribe": "SUBSCRIBE",
  "CoinExpire": "COIN_EXPIRE",
  "CoinRefund": "COIN_REFUND",
  "Admin": "ADMIN"
} as const;
export type CoinWithdrawalType = typeof CoinWithdrawalType[keyof typeof CoinWithdrawalType];

export const ContactStatus = {
  "Pending": "PENDING",
  "PendingChild": "PENDING_CHILD",
  "Holding": "HOLDING",
  "InProgress": "IN_PROGRESS",
  "Completed": "COMPLETED",
  "Closed": "CLOSED"
} as const;
export type ContactStatus = typeof ContactStatus[keyof typeof ContactStatus];

export const ContestConsentType = {
  "AdditionalMaterialEmail": "ADDITIONAL_MATERIAL_EMAIL"
} as const;
export type ContestConsentType = typeof ContestConsentType[keyof typeof ContestConsentType];

export const ContestServingPhase = {
  "Open": "OPEN",
  "Judging": "JUDGING"
} as const;
export type ContestServingPhase = typeof ContestServingPhase[keyof typeof ContestServingPhase];

export const ContestSubmissionSectionType = {
  "Story": "STORY",
  "Worldview": "WORLDVIEW",
  "Characters": "CHARACTERS",
  "Intro": "INTRO",
  "Additional1": "ADDITIONAL_1",
  "Additional2": "ADDITIONAL_2"
} as const;
export type ContestSubmissionSectionType = typeof ContestSubmissionSectionType[keyof typeof ContestSubmissionSectionType];

export const CreateRoomIntent = {
  "NewChat": "NEW_CHAT",
  "NewChatUnconfirmed": "NEW_CHAT_UNCONFIRMED",
  "NewChatConfirmed": "NEW_CHAT_CONFIRMED",
  "Auto": "AUTO"
} as const;
export type CreateRoomIntent = typeof CreateRoomIntent[keyof typeof CreateRoomIntent];

export const CreatorPlotReviewState = {
  "None": "NONE",
  "Reviewing": "REVIEWING",
  "Rejected": "REJECTED"
} as const;
export type CreatorPlotReviewState = typeof CreatorPlotReviewState[keyof typeof CreatorPlotReviewState];

export const CreatorReactionSource = {
  "FeedPostComment": "FEED_POST_COMMENT",
  "PlotComment": "PLOT_COMMENT"
} as const;
export type CreatorReactionSource = typeof CreatorReactionSource[keyof typeof CreatorReactionSource];

export const CreatorSearchOrder = {
  "Relevance": "RELEVANCE",
  "RecentActivity": "RECENT_ACTIVITY"
} as const;
export type CreatorSearchOrder = typeof CreatorSearchOrder[keyof typeof CreatorSearchOrder];

export const CropAnchor = {
  "Center": "CENTER",
  "Top": "TOP"
} as const;
export type CropAnchor = typeof CropAnchor[keyof typeof CropAnchor];

export const Currency = {
  "Krw": "KRW",
  "Jpy": "JPY",
  "Usd": "USD"
} as const;
export type Currency = typeof Currency[keyof typeof Currency];

export const CyoaType = {
  "Keyword": "KEYWORD",
  "Dialogue": "DIALOGUE"
} as const;
export type CyoaType = typeof CyoaType[keyof typeof CyoaType];

export const DevelopmentStyle = {
  "DialogueFocused": "DIALOGUE_FOCUSED",
  "Default": "DEFAULT",
  "ActionFocused": "ACTION_FOCUSED"
} as const;
export type DevelopmentStyle = typeof DevelopmentStyle[keyof typeof DevelopmentStyle];

export const Difficulty = {
  "Easy": "EASY",
  "Normal": "NORMAL",
  "Hard": "HARD",
  "Nightmare": "NIGHTMARE"
} as const;
export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

export const EvaluationLevel = {
  "Excellent": "EXCELLENT",
  "AboveAverage": "ABOVE_AVERAGE",
  "Average": "AVERAGE",
  "BelowAverage": "BELOW_AVERAGE",
  "Poor": "POOR"
} as const;
export type EvaluationLevel = typeof EvaluationLevel[keyof typeof EvaluationLevel];

export const EventBadge = {
  "PixaiContest": "PIXAI_CONTEST"
} as const;
export type EventBadge = typeof EventBadge[keyof typeof EventBadge];

export const ExceptionCode = {
  "NotFound": "NOT_FOUND",
  "InternalServerError": "INTERNAL_SERVER_ERROR",
  "Forbidden": "FORBIDDEN",
  "BadRequest": "BAD_REQUEST",
  "MethodNotAllowed": "METHOD_NOT_ALLOWED",
  "NotAcceptable": "NOT_ACCEPTABLE",
  "TooManyRequest": "TOO_MANY_REQUEST",
  "Conflict": "CONFLICT",
  "Gone": "GONE",
  "PreconditionFailed": "PRECONDITION_FAILED",
  "UnprocessableEntity": "UNPROCESSABLE_ENTITY",
  "Unauthorized": "UNAUTHORIZED",
  "AuthExpired": "AUTH_EXPIRED",
  "AuthInvalidUser": "AUTH_INVALID_USER",
  "AnonymousNotAllowed": "ANONYMOUS_NOT_ALLOWED",
  "ForbiddenByAcl": "FORBIDDEN_BY_ACL",
  "ServiceAccountUnauthorized": "SERVICE_ACCOUNT_UNAUTHORIZED",
  "ServiceAccountForbidden": "SERVICE_ACCOUNT_FORBIDDEN",
  "ServiceAccountNotAllowed": "SERVICE_ACCOUNT_NOT_ALLOWED",
  "MaxAuthCountExceeded": "MAX_AUTH_COUNT_EXCEEDED",
  "AdditionalAuthIdBanned": "ADDITIONAL_AUTH_ID_BANNED",
  "AdditionalAuthIdentityMismatch": "ADDITIONAL_AUTH_IDENTITY_MISMATCH",
  "LayoutNotFound": "LAYOUT_NOT_FOUND",
  "ContestNotOpen": "CONTEST_NOT_OPEN",
  "ContestNotEligible": "CONTEST_NOT_ELIGIBLE",
  "ContestInvalidEmail": "CONTEST_INVALID_EMAIL",
  "ContestInvalidPhone": "CONTEST_INVALID_PHONE",
  "ContestPlotPrivate": "CONTEST_PLOT_PRIVATE",
  "ContestRequiredConsent": "CONTEST_REQUIRED_CONSENT",
  "ContestCategoryInUse": "CONTEST_CATEGORY_IN_USE",
  "ContestSubmissionClosed": "CONTEST_SUBMISSION_CLOSED",
  "ContestSubmissionTextTooLong": "CONTEST_SUBMISSION_TEXT_TOO_LONG",
  "ContestSubmissionImageCountExceeded": "CONTEST_SUBMISSION_IMAGE_COUNT_EXCEEDED",
  "UsernameAlreadyExists": "USERNAME_ALREADY_EXISTS",
  "UserBanned": "USER_BANNED",
  "AbusedUserInfo": "ABUSED_USER_INFO",
  "UserAlreadyWithdrawn": "USER_ALREADY_WITHDRAWN",
  "BlockedUser": "BLOCKED_USER",
  "UserUserBlocked": "USER_USER_BLOCKED",
  "UserBlockedUser": "USER_BLOCKED_USER",
  "UserAbusedProfileImage": "USER_ABUSED_PROFILE_IMAGE",
  "UserAbusedCoverImage": "USER_ABUSED_COVER_IMAGE",
  "UserChatProfileMinimumLimit": "USER_CHAT_PROFILE_MINIMUM_LIMIT",
  "UserChatProfileMaximumLimit": "USER_CHAT_PROFILE_MAXIMUM_LIMIT",
  "UserChatProfileSelectedAlreadyExists": "USER_CHAT_PROFILE_SELECTED_ALREADY_EXISTS",
  "UserChatProfileSelectedRequired": "USER_CHAT_PROFILE_SELECTED_REQUIRED",
  "UserChatProfileAbused": "USER_CHAT_PROFILE_ABUSED",
  "UserAbusedChatProfileImage": "USER_ABUSED_CHAT_PROFILE_IMAGE",
  "UserPlotChatProfileAbused": "USER_PLOT_CHAT_PROFILE_ABUSED",
  "UserPlotChatProfileNameLengthLimit": "USER_PLOT_CHAT_PROFILE_NAME_LENGTH_LIMIT",
  "UserPlotChatProfileSummaryLengthLimit": "USER_PLOT_CHAT_PROFILE_SUMMARY_LENGTH_LIMIT",
  "UserPlotChatProfileDescriptionLengthLimit": "USER_PLOT_CHAT_PROFILE_DESCRIPTION_LENGTH_LIMIT",
  "CreatorDashboardIllegalEvaluationLevel": "CREATOR_DASHBOARD_ILLEGAL_EVALUATION_LEVEL",
  "CreatorDashboardPlotStatsNotFound": "CREATOR_DASHBOARD_PLOT_STATS_NOT_FOUND",
  "PlotIsNotCompleted": "PLOT_IS_NOT_COMPLETED",
  "PlotNameConstraintViolation": "PLOT_NAME_CONSTRAINT_VIOLATION",
  "PlotShortDescriptionConstraintViolation": "PLOT_SHORT_DESCRIPTION_CONSTRAINT_VIOLATION",
  "PlotCharacterImageConstraintViolation": "PLOT_CHARACTER_IMAGE_CONSTRAINT_VIOLATION",
  "PlotCharacterConstraintViolation": "PLOT_CHARACTER_CONSTRAINT_VIOLATION",
  "PlotCharacterNameDuplicateConstraintViolation": "PLOT_CHARACTER_NAME_DUPLICATE_CONSTRAINT_VIOLATION",
  "PlotContentConstraintViolation": "PLOT_CONTENT_CONSTRAINT_VIOLATION",
  "PlotIntroConstraintViolation": "PLOT_INTRO_CONSTRAINT_VIOLATION",
  "PlotChatProfileConstraintViolation": "PLOT_CHAT_PROFILE_CONSTRAINT_VIOLATION",
  "PlotChatProfileNotFound": "PLOT_CHAT_PROFILE_NOT_FOUND",
  "PlotChatProfileNameDuplicateConstraintViolation": "PLOT_CHAT_PROFILE_NAME_DUPLICATE_CONSTRAINT_VIOLATION",
  "PlotExampleConversationConstraintViolation": "PLOT_EXAMPLE_CONVERSATION_CONSTRAINT_VIOLATION",
  "PlotCreatorCommentConstraintViolation": "PLOT_CREATOR_COMMENT_CONSTRAINT_VIOLATION",
  "PlotImageTooLarge": "PLOT_IMAGE_TOO_LARGE",
  "PlotImageGenerationBlocked": "PLOT_IMAGE_GENERATION_BLOCKED",
  "PlotImageBannedKeyword": "PLOT_IMAGE_BANNED_KEYWORD",
  "PlotImageDeletePartiallyFailed": "PLOT_IMAGE_DELETE_PARTIALLY_FAILED",
  "PlotAbusedName": "PLOT_ABUSED_NAME",
  "PlotAbusedIntro": "PLOT_ABUSED_INTRO",
  "PlotAbusedShortDescription": "PLOT_ABUSED_SHORT_DESCRIPTION",
  "PlotAbusedLongDescription": "PLOT_ABUSED_LONG_DESCRIPTION",
  "PlotAbusedNarrator": "PLOT_ABUSED_NARRATOR",
  "PlotAbusedCharacterName": "PLOT_ABUSED_CHARACTER_NAME",
  "PlotAbusedCharacterDescription": "PLOT_ABUSED_CHARACTER_DESCRIPTION",
  "PlotAbusedProfileImage": "PLOT_ABUSED_PROFILE_IMAGE",
  "PlotAbusedHashtag": "PLOT_ABUSED_HASHTAG",
  "PlotAbusedCreatorComment": "PLOT_ABUSED_CREATOR_COMMENT",
  "PlotAbusedChatProfileImage": "PLOT_ABUSED_CHAT_PROFILE_IMAGE",
  "PlotAbusedChatProfileName": "PLOT_ABUSED_CHAT_PROFILE_NAME",
  "PlotAbusedChatProfileSummary": "PLOT_ABUSED_CHAT_PROFILE_SUMMARY",
  "PlotAbusedChatProfileDescription": "PLOT_ABUSED_CHAT_PROFILE_DESCRIPTION",
  "PlotAbusedAbout": "PLOT_ABUSED_ABOUT",
  "PlotAbusedAboutCharacterDescription": "PLOT_ABUSED_ABOUT_CHARACTER_DESCRIPTION",
  "PlotAbusedExampleConversation": "PLOT_ABUSED_EXAMPLE_CONVERSATION",
  "CannotBlockMyPlot": "CANNOT_BLOCK_MY_PLOT",
  "InvalidAudioFormat": "INVALID_AUDIO_FORMAT",
  "PlotAboutImageCountExceeded": "PLOT_ABOUT_IMAGE_COUNT_EXCEEDED",
  "PlotAboutImageAbused": "PLOT_ABOUT_IMAGE_ABUSED",
  "PlotAboutConstraintViolation": "PLOT_ABOUT_CONSTRAINT_VIOLATION",
  "PlotIntroAudioFileTooLarge": "PLOT_INTRO_AUDIO_FILE_TOO_LARGE",
  "PlotIntroAudioDurationCannotBeDetected": "PLOT_INTRO_AUDIO_DURATION_CANNOT_BE_DETECTED",
  "PlotIntroAudioDurationTooLong": "PLOT_INTRO_AUDIO_DURATION_TOO_LONG",
  "PlotIntroImageCountExceeded": "PLOT_INTRO_IMAGE_COUNT_EXCEEDED",
  "PlotIntroSingleImageTooLarge": "PLOT_INTRO_SINGLE_IMAGE_TOO_LARGE",
  "PlotIntroTotalImagesSizeExceeded": "PLOT_INTRO_TOTAL_IMAGES_SIZE_EXCEEDED",
  "PlotIntroImageCaptionLengthExceeded": "PLOT_INTRO_IMAGE_CAPTION_LENGTH_EXCEEDED",
  "PlotIntroImageCaptionAbused": "PLOT_INTRO_IMAGE_CAPTION_ABUSED",
  "PlotIntroImageNotFound": "PLOT_INTRO_IMAGE_NOT_FOUND",
  "PlotIntroImageAbused": "PLOT_INTRO_IMAGE_ABUSED",
  "RoomAccessDenied": "ROOM_ACCESS_DENIED",
  "RoomNotActive": "ROOM_NOT_ACTIVE",
  "RoomNotSaved": "ROOM_NOT_SAVED",
  "SaveRoomLimitExceeded": "SAVE_ROOM_LIMIT_EXCEEDED",
  "PinRoomLimitExceeded": "PIN_ROOM_LIMIT_EXCEEDED",
  "RoomEmptyError": "ROOM_EMPTY_ERROR",
  "RoomDemoteConfirmRequired": "ROOM_DEMOTE_CONFIRM_REQUIRED",
  "MessageDeleteLimitExceeded": "MESSAGE_DELETE_LIMIT_EXCEEDED",
  "MessageDeleteConfirmRequired": "MESSAGE_DELETE_CONFIRM_REQUIRED",
  "LegacyMessageDeleteError": "LEGACY_MESSAGE_DELETE_ERROR",
  "BookmarkLimitExceeded": "BOOKMARK_LIMIT_EXCEEDED",
  "AbusedSearchKeyword": "ABUSED_SEARCH_KEYWORD",
  "KeywordAlreadyExists": "KEYWORD_ALREADY_EXISTS",
  "AnonymousLimitExceeded": "ANONYMOUS_LIMIT_EXCEEDED",
  "WebLimitExceeded": "WEB_LIMIT_EXCEEDED",
  "ServiceMaintenance": "SERVICE_MAINTENANCE",
  "AppUpdateRequired": "APP_UPDATE_REQUIRED",
  "AlreadyCreatedNuttyUser": "ALREADY_CREATED_NUTTY_USER",
  "RegenCandidateLimitExceeded": "REGEN_CANDIDATE_LIMIT_EXCEEDED",
  "ChatEditAbused": "CHAT_EDIT_ABUSED",
  "CharacterChatFromUserAbused": "CHARACTER_CHAT_FROM_USER_ABUSED",
  "ChatAbused": "CHAT_ABUSED",
  "ChatPenaltySuspended": "CHAT_PENALTY_SUSPENDED",
  "AbusingInferenceResultNotFound": "ABUSING_INFERENCE_RESULT_NOT_FOUND",
  "ChatMissingPromptTemplate": "CHAT_MISSING_PROMPT_TEMPLATE",
  "PromptTemplateLocked": "PROMPT_TEMPLATE_LOCKED",
  "InvalidTokenizerConfigPath": "INVALID_TOKENIZER_CONFIG_PATH",
  "UnsupportedTokenizerConfigPath": "UNSUPPORTED_TOKENIZER_CONFIG_PATH",
  "ModelServingIdNotSpecified": "MODEL_SERVING_ID_NOT_SPECIFIED",
  "ModelServingNotFound": "MODEL_SERVING_NOT_FOUND",
  "GeminiInferenceFailure": "GEMINI_INFERENCE_FAILURE",
  "FetchOriginImageFailure": "FETCH_ORIGIN_IMAGE_FAILURE",
  "PushMessageAbused": "PUSH_MESSAGE_ABUSED",
  "ProRequired": "PRO_REQUIRED",
  "NotEnoughCoin": "NOT_ENOUGH_COIN",
  "NotEnoughCoinForCustomRegen": "NOT_ENOUGH_COIN_FOR_CUSTOM_REGEN",
  "PriceChangeAckRequired": "PRICE_CHANGE_ACK_REQUIRED",
  "AlreadyConsumed": "ALREADY_CONSUMED",
  "AlreadyRevoked": "ALREADY_REVOKED",
  "DiceRollNotRequested": "DICE_ROLL_NOT_REQUESTED",
  "DiceRollNotRolled": "DICE_ROLL_NOT_ROLLED",
  "DiceRerollNotAllowed": "DICE_REROLL_NOT_ALLOWED",
  "DiceRerollPurchaseRequired": "DICE_REROLL_PURCHASE_REQUIRED",
  "DiceRollResultStale": "DICE_ROLL_RESULT_STALE",
  "DiceRewardAdRerollExhausted": "DICE_REWARD_AD_REROLL_EXHAUSTED",
  "DiceRewardAdProofReused": "DICE_REWARD_AD_PROOF_REUSED",
  "DiceRerollProofConflict": "DICE_REROLL_PROOF_CONFLICT",
  "CaseAlreadyActive": "CASE_ALREADY_ACTIVE",
  "CaseNotActive": "CASE_NOT_ACTIVE",
  "CaseEndNotProposed": "CASE_END_NOT_PROPOSED",
  "CaseNotDeclinable": "CASE_NOT_DECLINABLE",
  "CaseAgentFailed": "CASE_AGENT_FAILED",
  "CasePendingActionNotFound": "CASE_PENDING_ACTION_NOT_FOUND",
  "CaseNotRedrawable": "CASE_NOT_REDRAWABLE",
  "CaseDrawnNotFound": "CASE_DRAWN_NOT_FOUND",
  "CasePriceChanged": "CASE_PRICE_CHANGED",
  "CasePurchaseRequired": "CASE_PURCHASE_REQUIRED",
  "CaseNotRequested": "CASE_NOT_REQUESTED",
  "CaseGenerating": "CASE_GENERATING",
  "CaseNotAvailable": "CASE_NOT_AVAILABLE",
  "NoteNoActiveCase": "NOTE_NO_ACTIVE_CASE",
  "NoteTextEmpty": "NOTE_TEXT_EMPTY",
  "NoteTextTooLong": "NOTE_TEXT_TOO_LONG",
  "NoteNameTooLong": "NOTE_NAME_TOO_LONG",
  "NoteEntryDuplicated": "NOTE_ENTRY_DUPLICATED",
  "NoteTargetNotFound": "NOTE_TARGET_NOT_FOUND",
  "NoteLimitExceeded": "NOTE_LIMIT_EXCEEDED",
  "NoteEditBusy": "NOTE_EDIT_BUSY",
  "NewspaperPriceChanged": "NEWSPAPER_PRICE_CHANGED",
  "NewspaperStoryDateMissing": "NEWSPAPER_STORY_DATE_MISSING",
  "SuddenEventResultNotPending": "SUDDEN_EVENT_RESULT_NOT_PENDING",
  "DatingShowVoteNotPending": "DATING_SHOW_VOTE_NOT_PENDING",
  "DatingShowVoteRequired": "DATING_SHOW_VOTE_REQUIRED",
  "DatingShowVoteTargetInvalid": "DATING_SHOW_VOTE_TARGET_INVALID",
  "DatingShowInterviewUnavailable": "DATING_SHOW_INTERVIEW_UNAVAILABLE",
  "DatingShowFeedInProgress": "DATING_SHOW_FEED_IN_PROGRESS",
  "DatingShowPeekUnavailable": "DATING_SHOW_PEEK_UNAVAILABLE",
  "DatingShowPriceChanged": "DATING_SHOW_PRICE_CHANGED",
  "IdolSurvivalEnvelopeUnopened": "IDOL_SURVIVAL_ENVELOPE_UNOPENED",
  "IdolSurvivalPriceChanged": "IDOL_SURVIVAL_PRICE_CHANGED",
  "IdolSurvivalContinueUnavailable": "IDOL_SURVIVAL_CONTINUE_UNAVAILABLE",
  "IdolSurvivalFeedInProgress": "IDOL_SURVIVAL_FEED_IN_PROGRESS",
  "IdolSurvivalFeedNoMessages": "IDOL_SURVIVAL_FEED_NO_MESSAGES",
  "IdolSurvivalProfileInvalid": "IDOL_SURVIVAL_PROFILE_INVALID",
  "IdolSurvivalCeremonyUnavailable": "IDOL_SURVIVAL_CEREMONY_UNAVAILABLE",
  "IdolSurvivalCeremonyNotReady": "IDOL_SURVIVAL_CEREMONY_NOT_READY",
  "IdolSurvivalEnvelopeUnavailable": "IDOL_SURVIVAL_ENVELOPE_UNAVAILABLE",
  "IdolSurvivalEpilogueUnavailable": "IDOL_SURVIVAL_EPILOGUE_UNAVAILABLE",
  "IdolSurvivalEpilogueInProgress": "IDOL_SURVIVAL_EPILOGUE_IN_PROGRESS",
  "IdolSurvivalOptionUnsupported": "IDOL_SURVIVAL_OPTION_UNSUPPORTED",
  "TextForVoiceEmpty": "TEXT_FOR_VOICE_EMPTY",
  "TextLengthForVoiceExceeded": "TEXT_LENGTH_FOR_VOICE_EXCEEDED",
  "RecommendMessageNotReady": "RECOMMEND_MESSAGE_NOT_READY",
  "RecommendMessageAlreadyAvailable": "RECOMMEND_MESSAGE_ALREADY_AVAILABLE",
  "RecommendMessageAbusedBefore": "RECOMMEND_MESSAGE_ABUSED_BEFORE",
  "RecommendMessageAbusing": "RECOMMEND_MESSAGE_ABUSING",
  "RecommendMessageQuotaExhausted": "RECOMMEND_MESSAGE_QUOTA_EXHAUSTED",
  "RecommendMessageQuotaNotExhausted": "RECOMMEND_MESSAGE_QUOTA_NOT_EXHAUSTED",
  "RecommendMessageRegenLimitExceeded": "RECOMMEND_MESSAGE_REGEN_LIMIT_EXCEEDED",
  "RecommendMessageNoRepliesGenerated": "RECOMMEND_MESSAGE_NO_REPLIES_GENERATED",
  "CreatorAssistantLlmParseFailed": "CREATOR_ASSISTANT_LLM_PARSE_FAILED",
  "NotFoundCoinSubscribeListener": "NOT_FOUND_COIN_SUBSCRIBE_LISTENER",
  "ExceedMaxAmount": "EXCEED_MAX_AMOUNT",
  "CoinAlreadyRefunded": "COIN_ALREADY_REFUNDED",
  "AutoPaymentInvalidMethod": "AUTO_PAYMENT_INVALID_METHOD",
  "AutoPaymentInsufficientBalance": "AUTO_PAYMENT_INSUFFICIENT_BALANCE",
  "AutoPaymentRejected": "AUTO_PAYMENT_REJECTED",
  "AutoPaymentMethodNotFound": "AUTO_PAYMENT_METHOD_NOT_FOUND",
  "AutoPaymentCustomerStatus": "AUTO_PAYMENT_CUSTOMER_STATUS",
  "AutoPaymentTemporaryError": "AUTO_PAYMENT_TEMPORARY_ERROR",
  "AutoPaymentBillingTermsRequired": "AUTO_PAYMENT_BILLING_TERMS_REQUIRED",
  "ZetaPassInvalidMethod": "ZETA_PASS_INVALID_METHOD",
  "ZetaPassInsufficientBalance": "ZETA_PASS_INSUFFICIENT_BALANCE",
  "ZetaPassRejected": "ZETA_PASS_REJECTED",
  "ZetaPassMethodNotFound": "ZETA_PASS_METHOD_NOT_FOUND",
  "ZetaPassCustomerStatus": "ZETA_PASS_CUSTOMER_STATUS",
  "ZetaPassTemporaryError": "ZETA_PASS_TEMPORARY_ERROR",
  "ZetaPassAlreadyActive": "ZETA_PASS_ALREADY_ACTIVE",
  "PaymentTemporarilyBlocked": "PAYMENT_TEMPORARILY_BLOCKED",
  "PaymentSuspended": "PAYMENT_SUSPENDED",
  "AdFreeAlreadyActive": "AD_FREE_ALREADY_ACTIVE",
  "ConversationsEmpty": "CONVERSATIONS_EMPTY",
  "ConversationsLastEmpty": "CONVERSATIONS_LAST_EMPTY",
  "AlreadyChosenOption": "ALREADY_CHOSEN_OPTION",
  "OptionChooseTimeExpired": "OPTION_CHOOSE_TIME_EXPIRED",
  "PodNotRunning": "POD_NOT_RUNNING",
  "NewTopicQuotaExhausted": "NEW_TOPIC_QUOTA_EXHAUSTED",
  "NewTopicFirstStepGenerateError": "NEW_TOPIC_FIRST_STEP_GENERATE_ERROR",
  "NewTopicSecondStepGenerateError": "NEW_TOPIC_SECOND_STEP_GENERATE_ERROR",
  "NewTopicMultispeakerError": "NEW_TOPIC_MULTISPEAKER_ERROR",
  "NewTopicAlreadyGenerating": "NEW_TOPIC_ALREADY_GENERATING",
  "QuizUnavailable": "QUIZ_UNAVAILABLE",
  "ClaudeStopError": "CLAUDE_STOP_ERROR",
  "ClaudeMultiSpeakerError": "CLAUDE_MULTI_SPEAKER_ERROR",
  "ClaudeStreamError": "CLAUDE_STREAM_ERROR",
  "GeminiStopError": "GEMINI_STOP_ERROR",
  "GeminiMultiSpeakerError": "GEMINI_MULTI_SPEAKER_ERROR",
  "GeminiMissingConfiguration": "GEMINI_MISSING_CONFIGURATION",
  "GeminiFirstTokenTimeThresholdExceeded": "GEMINI_FIRST_TOKEN_TIME_THRESHOLD_EXCEEDED",
  "ImageUploadRequestError": "IMAGE_UPLOAD_REQUEST_ERROR",
  "UnsupportedImageFormat": "UNSUPPORTED_IMAGE_FORMAT",
  "CropSizeTooSmall": "CROP_SIZE_TOO_SMALL",
  "Zetto2InvalidVideoUrl": "ZETTO2_INVALID_VIDEO_URL",
  "Zetto2VideoAlreadySubmitted": "ZETTO2_VIDEO_ALREADY_SUBMITTED",
  "Zetto2GatchaNoRemainingDailyDraws": "ZETTO2_GATCHA_NO_REMAINING_DAILY_DRAWS",
  "Zetto2AlreadyVoted": "ZETTO2_ALREADY_VOTED",
  "TakarakujiInvalidVideoUrl": "TAKARAKUJI_INVALID_VIDEO_URL",
  "TakarakujiVideoAlreadySubmitted": "TAKARAKUJI_VIDEO_ALREADY_SUBMITTED",
  "TakarakujiUnsupportedPlatform": "TAKARAKUJI_UNSUPPORTED_PLATFORM",
  "ExperimentMetadataValidationFailed": "EXPERIMENT_METADATA_VALIDATION_FAILED",
  "LorebookNoItems": "LOREBOOK_NO_ITEMS",
  "LorebookMaxItemsExceeded": "LOREBOOK_MAX_ITEMS_EXCEEDED",
  "LorebookContentsTooLong": "LOREBOOK_CONTENTS_TOO_LONG",
  "LorebookMaxPlotRelationsExceeded": "LOREBOOK_MAX_PLOT_RELATIONS_EXCEEDED",
  "LorebookItemContentsEmpty": "LOREBOOK_ITEM_CONTENTS_EMPTY",
  "LorebookItemKeywordsEmpty": "LOREBOOK_ITEM_KEYWORDS_EMPTY",
  "LorebookAbused": "LOREBOOK_ABUSED",
  "LorebookMaxLorebooksExceeded": "LOREBOOK_MAX_LOREBOOKS_EXCEEDED",
  "LorebookForkedNotEditable": "LOREBOOK_FORKED_NOT_EDITABLE",
  "FeatureNotAvailable": "FEATURE_NOT_AVAILABLE",
  "PlotManagedLocked": "PLOT_MANAGED_LOCKED",
  "PlotMemoLengthLimitExceeded": "PLOT_MEMO_LENGTH_LIMIT_EXCEEDED",
  "ContactMemoLengthLimitExceeded": "CONTACT_MEMO_LENGTH_LIMIT_EXCEEDED",
  "CommentNotFound": "COMMENT_NOT_FOUND",
  "CommentTooLong": "COMMENT_TOO_LONG",
  "CommentContainsUrl": "COMMENT_CONTAINS_URL",
  "CommentForbidden": "COMMENT_FORBIDDEN",
  "CommentModerated": "COMMENT_MODERATED",
  "CommentDisabled": "COMMENT_DISABLED",
  "CommentBannedKeyword": "COMMENT_BANNED_KEYWORD",
  "CommentWriteBanned": "COMMENT_WRITE_BANNED",
  "CommentAlreadyPinned": "COMMENT_ALREADY_PINNED",
  "CommentAlreadyReported": "COMMENT_ALREADY_REPORTED",
  "CommentEmpty": "COMMENT_EMPTY",
  "CommentSnapshotNotFound": "COMMENT_SNAPSHOT_NOT_FOUND",
  "CommentSnapshotNotShareable": "COMMENT_SNAPSHOT_NOT_SHAREABLE",
  "CommentSnapshotAbusing": "COMMENT_SNAPSHOT_ABUSING",
  "CommentCannotPinReply": "COMMENT_CANNOT_PIN_REPLY",
  "CommentParentNotFound": "COMMENT_PARENT_NOT_FOUND",
  "CommentTranslationUnavailable": "COMMENT_TRANSLATION_UNAVAILABLE",
  "ReportLimitExceeded": "REPORT_LIMIT_EXCEEDED",
  "FeedPostNotFound": "FEED_POST_NOT_FOUND",
  "FeedPostEmpty": "FEED_POST_EMPTY",
  "FeedPostTooLong": "FEED_POST_TOO_LONG",
  "FeedPostForbidden": "FEED_POST_FORBIDDEN",
  "FeedPostImageCountExceeded": "FEED_POST_IMAGE_COUNT_EXCEEDED",
  "FeedPostImageTooLarge": "FEED_POST_IMAGE_TOO_LARGE",
  "FeedPostImageTotalSizeExceeded": "FEED_POST_IMAGE_TOTAL_SIZE_EXCEEDED",
  "FeedPostPinNotAllowed": "FEED_POST_PIN_NOT_ALLOWED",
  "FeedPostAlreadyPinned": "FEED_POST_ALREADY_PINNED",
  "FeedPostCommentNotFound": "FEED_POST_COMMENT_NOT_FOUND",
  "FeedPostCommentEmpty": "FEED_POST_COMMENT_EMPTY",
  "FeedPostCommentTooLong": "FEED_POST_COMMENT_TOO_LONG",
  "FeedPostCommentDisabled": "FEED_POST_COMMENT_DISABLED",
  "FeedPostCommentParentNotFound": "FEED_POST_COMMENT_PARENT_NOT_FOUND",
  "FeedPostCommentForbidden": "FEED_POST_COMMENT_FORBIDDEN",
  "FeedPostCommentPinNotAllowed": "FEED_POST_COMMENT_PIN_NOT_ALLOWED",
  "FeedPostInvalidBlock": "FEED_POST_INVALID_BLOCK",
  "FeedPostPlotNotOwned": "FEED_POST_PLOT_NOT_OWNED",
  "FeedPostPlotCountExceeded": "FEED_POST_PLOT_COUNT_EXCEEDED",
  "FeedPostPlotLanguageMismatch": "FEED_POST_PLOT_LANGUAGE_MISMATCH",
  "FeedPostBannedKeyword": "FEED_POST_BANNED_KEYWORD",
  "FeedPostAbuseBlocked": "FEED_POST_ABUSE_BLOCKED",
  "FeedPostImageRejected": "FEED_POST_IMAGE_REJECTED",
  "FeedPostImageReviewUnavailable": "FEED_POST_IMAGE_REVIEW_UNAVAILABLE",
  "FeedPostAlreadyReported": "FEED_POST_ALREADY_REPORTED",
  "FeedPostReportLimitExceeded": "FEED_POST_REPORT_LIMIT_EXCEEDED",
  "FeedPostWriteBanned": "FEED_POST_WRITE_BANNED",
  "FeedPostCommentBannedKeyword": "FEED_POST_COMMENT_BANNED_KEYWORD",
  "FeedPostCommentAbuseBlocked": "FEED_POST_COMMENT_ABUSE_BLOCKED",
  "FeedPostCommentAlreadyReported": "FEED_POST_COMMENT_ALREADY_REPORTED",
  "FeedPollNotFound": "FEED_POLL_NOT_FOUND",
  "FeedPollOptionNotFound": "FEED_POLL_OPTION_NOT_FOUND",
  "FeedPollAlreadyVoted": "FEED_POLL_ALREADY_VOTED",
  "FeedPollClosed": "FEED_POLL_CLOSED",
  "FeedPollOwnerCannotVote": "FEED_POLL_OWNER_CANNOT_VOTE",
  "FeedPollVotersForbidden": "FEED_POLL_VOTERS_FORBIDDEN",
  "FeedPollNotEditable": "FEED_POLL_NOT_EDITABLE",
  "FeedPollCountExceeded": "FEED_POLL_COUNT_EXCEEDED",
  "FeedPollQuestionEmpty": "FEED_POLL_QUESTION_EMPTY",
  "FeedPollQuestionTooLong": "FEED_POLL_QUESTION_TOO_LONG",
  "FeedPollOptionCountInvalid": "FEED_POLL_OPTION_COUNT_INVALID",
  "FeedPollOptionEmpty": "FEED_POLL_OPTION_EMPTY",
  "FeedPollOptionTooLong": "FEED_POLL_OPTION_TOO_LONG",
  "FeedPollDurationInvalid": "FEED_POLL_DURATION_INVALID",
  "RedemptionCodeNotFound": "REDEMPTION_CODE_NOT_FOUND",
  "RedemptionCodeAlreadyRedeemed": "REDEMPTION_CODE_ALREADY_REDEEMED",
  "RedemptionCodeLimitReached": "REDEMPTION_CODE_LIMIT_REACHED",
  "RedemptionCodeExpired": "REDEMPTION_CODE_EXPIRED",
  "RedemptionCodeSubscriptionNotAllowed": "REDEMPTION_CODE_SUBSCRIPTION_NOT_ALLOWED",
  "ZlabsProxyUpstreamError": "ZLABS_PROXY_UPSTREAM_ERROR",
  "ZlabsProxyPayloadTooLarge": "ZLABS_PROXY_PAYLOAD_TOO_LARGE",
  "PluginNotFound": "PLUGIN_NOT_FOUND",
  "PluginEventContentInvalid": "PLUGIN_EVENT_CONTENT_INVALID",
  "PluginIdInvalid": "PLUGIN_ID_INVALID",
  "PluginValueInvalid": "PLUGIN_VALUE_INVALID",
  "PluginStoreLimitExceeded": "PLUGIN_STORE_LIMIT_EXCEEDED",
  "PluginDisabled": "PLUGIN_DISABLED",
  "PluginSessionOpenBlocked": "PLUGIN_SESSION_OPEN_BLOCKED",
  "PluginResourceNotFound": "PLUGIN_RESOURCE_NOT_FOUND",
  "PluginLimitExceeded": "PLUGIN_LIMIT_EXCEEDED",
  "PluginExecutionFailed": "PLUGIN_EXECUTION_FAILED",
  "PluginInputBannedKeyword": "PLUGIN_INPUT_BANNED_KEYWORD",
  "PluginInputAbuseBlocked": "PLUGIN_INPUT_ABUSE_BLOCKED",
  "PluginNotRunnable": "PLUGIN_NOT_RUNNABLE",
  "PluginNotAvailable": "PLUGIN_NOT_AVAILABLE",
  "CharacterDiaryNotEnoughTurns": "CHARACTER_DIARY_NOT_ENOUGH_TURNS",
  "CharacterDiaryGenerationInProgress": "CHARACTER_DIARY_GENERATION_IN_PROGRESS",
  "CharacterDiaryPriceChanged": "CHARACTER_DIARY_PRICE_CHANGED",
  "EndingPriceChanged": "ENDING_PRICE_CHANGED",
  "EndingGenerationFailed": "ENDING_GENERATION_FAILED",
  "EndingContinueDoesNotStartTurn": "ENDING_CONTINUE_DOES_NOT_START_TURN",
  "CartoonifyTooManyMessages": "CARTOONIFY_TOO_MANY_MESSAGES",
  "CartoonifyMessageRangeInvalid": "CARTOONIFY_MESSAGE_RANGE_INVALID",
  "CartoonifyNoCharacterImage": "CARTOONIFY_NO_CHARACTER_IMAGE",
  "CartoonifyCommentTooLong": "CARTOONIFY_COMMENT_TOO_LONG",
  "CartoonifyGenerationInProgress": "CARTOONIFY_GENERATION_IN_PROGRESS",
  "CartoonifyPriceChanged": "CARTOONIFY_PRICE_CHANGED",
  "AnonymousBoardRefreshInProgress": "ANONYMOUS_BOARD_REFRESH_IN_PROGRESS",
  "AnonymousBoardPriceChanged": "ANONYMOUS_BOARD_PRICE_CHANGED",
  "AnonymousBoardAlreadyVoted": "ANONYMOUS_BOARD_ALREADY_VOTED",
  "AnonymousBoardNotAPoll": "ANONYMOUS_BOARD_NOT_A_POLL",
  "AnonymousBoardAuthorNameReserved": "ANONYMOUS_BOARD_AUTHOR_NAME_RESERVED",
  "PhonePeekAlreadyPeeked": "PHONE_PEEK_ALREADY_PEEKED",
  "PhonePeekGenerationInProgress": "PHONE_PEEK_GENERATION_IN_PROGRESS",
  "PhonePeekCharacterNotTargeted": "PHONE_PEEK_CHARACTER_NOT_TARGETED",
  "PhonePeekCursorNotLatest": "PHONE_PEEK_CURSOR_NOT_LATEST",
  "PhonePeekGenerationNotFound": "PHONE_PEEK_GENERATION_NOT_FOUND",
  "DreamExpired": "DREAM_EXPIRED",
  "DreamPriceChanged": "DREAM_PRICE_CHANGED",
  "GhostChatPriceChanged": "GHOST_CHAT_PRICE_CHANGED",
  "GhostChatGenerationInProgress": "GHOST_CHAT_GENERATION_IN_PROGRESS",
  "GhostChatNotStarted": "GHOST_CHAT_NOT_STARTED",
  "GhostChatInvalidMessage": "GHOST_CHAT_INVALID_MESSAGE",
  "ZetrisHandleNotFound": "ZETRIS_HANDLE_NOT_FOUND",
  "ZetrisInvalidHandle": "ZETRIS_INVALID_HANDLE",
  "ZetrisInvalidNickname": "ZETRIS_INVALID_NICKNAME",
  "ZetrisUnsupportedRules": "ZETRIS_UNSUPPORTED_RULES",
  "ZetrisSessionExpired": "ZETRIS_SESSION_EXPIRED",
  "ZetrisInvalidReplay": "ZETRIS_INVALID_REPLAY",
  "ZetrisReplayRejected": "ZETRIS_REPLAY_REJECTED",
  "ZetrisVerificationBusy": "ZETRIS_VERIFICATION_BUSY",
  "Frame4cutEventClosed": "FRAME_4CUT_EVENT_CLOSED",
  "Frame4cutCreateDisabled": "FRAME_4CUT_CREATE_DISABLED",
  "Frame4cutFeaturesDisabled": "FRAME_4CUT_FEATURES_DISABLED",
  "Frame4cutNotFound": "FRAME_4CUT_NOT_FOUND",
  "Frame4cutPlotUnavailable": "FRAME_4CUT_PLOT_UNAVAILABLE",
  "Frame4cutSnapshotUnsupported": "FRAME_4CUT_SNAPSHOT_UNSUPPORTED",
  "Frame4cutOptionUnavailable": "FRAME_4CUT_OPTION_UNAVAILABLE",
  "Frame4cutInvalidPartner": "FRAME_4CUT_INVALID_PARTNER",
  "Frame4cutPriceChanged": "FRAME_4CUT_PRICE_CHANGED",
  "Frame4cutFreeBusy": "FRAME_4CUT_FREE_BUSY",
  "Frame4cutInProgress": "FRAME_4CUT_IN_PROGRESS",
  "Frame4cutVideoAlreadyPurchased": "FRAME_4CUT_VIDEO_ALREADY_PURCHASED",
  "Frame4cutVideoDisabled": "FRAME_4CUT_VIDEO_DISABLED",
  "Frame4cutWallAbusing": "FRAME_4CUT_WALL_ABUSING",
  "Frame4cutWallAlreadyPosted": "FRAME_4CUT_WALL_ALREADY_POSTED",
  "Frame4cutWallRemoved": "FRAME_4CUT_WALL_REMOVED",
  "Frame4cutCannotLikeOwn": "FRAME_4CUT_CANNOT_LIKE_OWN",
  "Frame4cutCannotReportOwn": "FRAME_4CUT_CANNOT_REPORT_OWN",
  "CommentAttachmentConflict": "COMMENT_ATTACHMENT_CONFLICT",
  "CommentFrame4cutNotFound": "COMMENT_FRAME_4CUT_NOT_FOUND",
  "CommentFrame4cutNotShareable": "COMMENT_FRAME_4CUT_NOT_SHAREABLE",
  "OshikoreHandleNotFound": "OSHIKORE_HANDLE_NOT_FOUND",
  "OshikoreInvalidHandle": "OSHIKORE_INVALID_HANDLE",
  "OshikoreInvalidNickname": "OSHIKORE_INVALID_NICKNAME",
  "OshikoreInvalidField": "OSHIKORE_INVALID_FIELD",
  "OshikoreUnsupportedRules": "OSHIKORE_UNSUPPORTED_RULES",
  "OshikoreSessionExpired": "OSHIKORE_SESSION_EXPIRED",
  "OshikoreInvalidReplay": "OSHIKORE_INVALID_REPLAY",
  "OshikoreReplayRejected": "OSHIKORE_REPLAY_REJECTED",
  "OshikoreReportNotAllowed": "OSHIKORE_REPORT_NOT_ALLOWED",
  "OshikoreCandidateUnavailable": "OSHIKORE_CANDIDATE_UNAVAILABLE",
  "OshikoreCandidateDecided": "OSHIKORE_CANDIDATE_DECIDED",
  "OshikoreCandidateIneligible": "OSHIKORE_CANDIDATE_INELIGIBLE",
  "OshikoreRegistrationLimit": "OSHIKORE_REGISTRATION_LIMIT",
  "OshikorePoolEmpty": "OSHIKORE_POOL_EMPTY",
  "OshikoreVerificationBusy": "OSHIKORE_VERIFICATION_BUSY",
  "HalloweenCurationLabsUnavailable": "HALLOWEEN_CURATION_LABS_UNAVAILABLE",
  "TrickOrTreatEventClosed": "TRICK_OR_TREAT_EVENT_CLOSED",
  "TrickOrTreatInviteNotFound": "TRICK_OR_TREAT_INVITE_NOT_FOUND",
  "TrickOrTreatNoChance": "TRICK_OR_TREAT_NO_CHANCE",
  "TrickOrTreatAlreadyPlayed": "TRICK_OR_TREAT_ALREADY_PLAYED",
  "TrickOrTreatPlayNotFound": "TRICK_OR_TREAT_PLAY_NOT_FOUND",
  "TrickOrTreatCharacterUnavailable": "TRICK_OR_TREAT_CHARACTER_UNAVAILABLE",
  "TrickOrTreatReplyFailed": "TRICK_OR_TREAT_REPLY_FAILED",
  "TrickOrTreatRerollUnavailable": "TRICK_OR_TREAT_REROLL_UNAVAILABLE",
  "TrickOrTreatWinningNotFound": "TRICK_OR_TREAT_WINNING_NOT_FOUND",
  "TrickOrTreatContactClosed": "TRICK_OR_TREAT_CONTACT_CLOSED",
  "HalloweenEventClosed": "HALLOWEEN_EVENT_CLOSED",
  "HalloweenNoCandy": "HALLOWEEN_NO_CANDY",
  "HalloweenTeamLocked": "HALLOWEEN_TEAM_LOCKED",
  "HalloweenRoundClosed": "HALLOWEEN_ROUND_CLOSED",
  "HalloweenNotParticipated": "HALLOWEEN_NOT_PARTICIPATED",
  "HalloweenSpookyLimitExceeded": "HALLOWEEN_SPOOKY_LIMIT_EXCEEDED",
  "HalloweenInvalidObjectToken": "HALLOWEEN_INVALID_OBJECT_TOKEN",
  "HalloweenMinigameAlreadyMatched": "HALLOWEEN_MINIGAME_ALREADY_MATCHED",
  "HalloweenNotSelected": "HALLOWEEN_NOT_SELECTED",
  "HalloweenShareAlreadySet": "HALLOWEEN_SHARE_ALREADY_SET",
  "HalloweenShareTimeOutOfRange": "HALLOWEEN_SHARE_TIME_OUT_OF_RANGE",
  "PlotFirstImpressionSurveyNotEligible": "PLOT_FIRST_IMPRESSION_SURVEY_NOT_ELIGIBLE",
  "PlotFirstImpressionSurveyInvalidResponse": "PLOT_FIRST_IMPRESSION_SURVEY_INVALID_RESPONSE"
} as const;
export type ExceptionCode = typeof ExceptionCode[keyof typeof ExceptionCode];

export const FaqFeedbackType = {
  "Positive": "POSITIVE",
  "Negative": "NEGATIVE"
} as const;
export type FaqFeedbackType = typeof FaqFeedbackType[keyof typeof FaqFeedbackType];

export const FeedPostCommentSort = {
  "Popular": "POPULAR",
  "Latest": "LATEST"
} as const;
export type FeedPostCommentSort = typeof FeedPostCommentSort[keyof typeof FeedPostCommentSort];

export const FeedPostStatus = {
  "Visible": "VISIBLE",
  "Hidden": "HIDDEN"
} as const;
export type FeedPostStatus = typeof FeedPostStatus[keyof typeof FeedPostStatus];

export const FollowOrderByProperty = {
  "FollowedAt": "FOLLOWED_AT"
} as const;
export type FollowOrderByProperty = typeof FollowOrderByProperty[keyof typeof FollowOrderByProperty];

export const ForResurrectedPlotRecommendationType = {
  "Longest": "LONGEST",
  "Latest": "LATEST",
  "TagPopular": "TAG_POPULAR",
  "Onboarding": "ONBOARDING",
  "Custom": "CUSTOM"
} as const;
export type ForResurrectedPlotRecommendationType = typeof ForResurrectedPlotRecommendationType[keyof typeof ForResurrectedPlotRecommendationType];

export const Frame4cutFailureReason = {
  "ModelError": "MODEL_ERROR",
  "Timeout": "TIMEOUT",
  "Blocked": "BLOCKED",
  "QueueTimeout": "QUEUE_TIMEOUT",
  "EmptySlot": "EMPTY_SLOT",
  "Internal": "INTERNAL",
  "PlotUnavailable": "PLOT_UNAVAILABLE"
} as const;
export type Frame4cutFailureReason = typeof Frame4cutFailureReason[keyof typeof Frame4cutFailureReason];

export const Frame4cutLayout = {
  "Strip1x4": "STRIP_1X4",
  "Grid2x2": "GRID_2X2",
  "Grid2x3": "GRID_2X3"
} as const;
export type Frame4cutLayout = typeof Frame4cutLayout[keyof typeof Frame4cutLayout];

export const Frame4cutPartnerType = {
  "UserChatProfile": "USER_CHAT_PROFILE",
  "PlotChatProfile": "PLOT_CHAT_PROFILE",
  "PlotCharacter": "PLOT_CHARACTER"
} as const;
export type Frame4cutPartnerType = typeof Frame4cutPartnerType[keyof typeof Frame4cutPartnerType];

export const Frame4cutPlotSource = {
  "Zeta": "ZETA",
  "Labs": "LABS"
} as const;
export type Frame4cutPlotSource = typeof Frame4cutPlotSource[keyof typeof Frame4cutPlotSource];

export const Frame4cutRankingTab = {
  "Plot": "PLOT",
  "User": "USER"
} as const;
export type Frame4cutRankingTab = typeof Frame4cutRankingTab[keyof typeof Frame4cutRankingTab];

export const Frame4cutRoomSort = {
  "MessageCount": "MESSAGE_COUNT",
  "LastMessageTime": "LAST_MESSAGE_TIME"
} as const;
export type Frame4cutRoomSort = typeof Frame4cutRoomSort[keyof typeof Frame4cutRoomSort];

export const Frame4cutStatus = {
  "Queued": "QUEUED",
  "Generating": "GENERATING",
  "Completed": "COMPLETED",
  "Failed": "FAILED"
} as const;
export type Frame4cutStatus = typeof Frame4cutStatus[keyof typeof Frame4cutStatus];

export const Frame4cutVideoStatus = {
  "NotPurchased": "NOT_PURCHASED",
  "Generating": "GENERATING",
  "Completed": "COMPLETED",
  "Failed": "FAILED"
} as const;
export type Frame4cutVideoStatus = typeof Frame4cutVideoStatus[keyof typeof Frame4cutVideoStatus];

export const Frame4cutWallPostStatus = {
  "Visible": "VISIBLE",
  "Hidden": "HIDDEN",
  "Removed": "REMOVED",
  "Detached": "DETACHED",
  "Blocked": "BLOCKED"
} as const;
export type Frame4cutWallPostStatus = typeof Frame4cutWallPostStatus[keyof typeof Frame4cutWallPostStatus];

export const Frame4cutWallSort = {
  "Posted": "POSTED",
  "Score": "SCORE"
} as const;
export type Frame4cutWallSort = typeof Frame4cutWallSort[keyof typeof Frame4cutWallSort];

export const Gender = {
  "Male": "MALE",
  "Female": "FEMALE",
  "Other": "OTHER"
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

export const GetRoomHighlightResponseRoomHighlightType = {
  "Replay": "REPLAY"
} as const;
export type GetRoomHighlightResponseRoomHighlightType = typeof GetRoomHighlightResponseRoomHighlightType[keyof typeof GetRoomHighlightResponseRoomHighlightType];

export const HalloweenAvatarFrame = {
  "SkullRose": "SKULL_ROSE",
  "PurpleWitch": "PURPLE_WITCH",
  "BatPumpkin": "BAT_PUMPKIN",
  "CatEars": "CAT_EARS",
  "PastelCandy": "PASTEL_CANDY",
  "BlueFlower": "BLUE_FLOWER",
  "DoodleGhost": "DOODLE_GHOST"
} as const;
export type HalloweenAvatarFrame = typeof HalloweenAvatarFrame[keyof typeof HalloweenAvatarFrame];

export const HalloweenCoverPreset = {
  "SkullWeb": "SKULL_WEB",
  "PumpkinPattern": "PUMPKIN_PATTERN",
  "OrangeGraveyard": "ORANGE_GRAVEYARD",
  "PurpleCastle": "PURPLE_CASTLE",
  "PastelGhost": "PASTEL_GHOST",
  "BlueMoonGhost": "BLUE_MOON_GHOST",
  "DoodleCat": "DOODLE_CAT"
} as const;
export type HalloweenCoverPreset = typeof HalloweenCoverPreset[keyof typeof HalloweenCoverPreset];

export const HalloweenCurationTheme = {
  "Requiem": "REQUIEM",
  "CuteTrick": "CUTE_TRICK",
  "Pumpkin": "PUMPKIN",
  "LunaCat": "LUNA_CAT",
  "Pastel": "PASTEL",
  "BlueMoon": "BLUE_MOON",
  "Doodle": "DOODLE"
} as const;
export type HalloweenCurationTheme = typeof HalloweenCurationTheme[keyof typeof HalloweenCurationTheme];

export const HalloweenMonster = {
  "Dracula": "DRACULA",
  "Ghost": "GHOST",
  "Zombie": "ZOMBIE"
} as const;
export type HalloweenMonster = typeof HalloweenMonster[keyof typeof HalloweenMonster];

export const HalloweenObjectType = {
  "Coffin": "COFFIN",
  "Zombie": "ZOMBIE",
  "Ghost": "GHOST",
  "GoldenPumpkin": "GOLDEN_PUMPKIN"
} as const;
export type HalloweenObjectType = typeof HalloweenObjectType[keyof typeof HalloweenObjectType];

export const HalloweenPieceClaimRefusal = {
  "NotOpen": "NOT_OPEN",
  "NotFollower": "NOT_FOLLOWER",
  "AlreadyClaimed": "ALREADY_CLAIMED",
  "Exhausted": "EXHAUSTED"
} as const;
export type HalloweenPieceClaimRefusal = typeof HalloweenPieceClaimRefusal[keyof typeof HalloweenPieceClaimRefusal];

export const HalloweenRewardStatus = {
  "None": "NONE",
  "Pending": "PENDING",
  "Granted": "GRANTED"
} as const;
export type HalloweenRewardStatus = typeof HalloweenRewardStatus[keyof typeof HalloweenRewardStatus];

export const HalloweenRoundStatus = {
  "Open": "OPEN",
  "Settling": "SETTLING",
  "Settled": "SETTLED",
  "NoWinner": "NO_WINNER"
} as const;
export type HalloweenRoundStatus = typeof HalloweenRoundStatus[keyof typeof HalloweenRoundStatus];

export const HalloweenVillageSlotKind = {
  "Creator": "CREATOR",
  "Object": "OBJECT"
} as const;
export type HalloweenVillageSlotKind = typeof HalloweenVillageSlotKind[keyof typeof HalloweenVillageSlotKind];

export const InfoBoxDateFormat = {
  "Date": "DATE",
  "DayCount": "DAY_COUNT"
} as const;
export type InfoBoxDateFormat = typeof InfoBoxDateFormat[keyof typeof InfoBoxDateFormat];

export const IntegratedPurchaseCoinProductRequestWithdrawalEffort = {
  "Exact": "EXACT",
  "AllowLess": "ALLOW_LESS"
} as const;
export type IntegratedPurchaseCoinProductRequestWithdrawalEffort = typeof IntegratedPurchaseCoinProductRequestWithdrawalEffort[keyof typeof IntegratedPurchaseCoinProductRequestWithdrawalEffort];

export const IosAgeRangeDeclaration = {
  "SelfDeclared": "SELF_DECLARED",
  "GuardianDeclared": "GUARDIAN_DECLARED",
  "Confirmed": "CONFIRMED",
  "PaymentChecked": "PAYMENT_CHECKED",
  "GovernmentIdChecked": "GOVERNMENT_ID_CHECKED",
  "CheckedByOtherMethod": "CHECKED_BY_OTHER_METHOD",
  "GuardianPaymentChecked": "GUARDIAN_PAYMENT_CHECKED",
  "GuardianGovernmentIdChecked": "GUARDIAN_GOVERNMENT_ID_CHECKED",
  "GuardianCheckedByOtherMethod": "GUARDIAN_CHECKED_BY_OTHER_METHOD",
  "Unrecognized": "UNRECOGNIZED"
} as const;
export type IosAgeRangeDeclaration = typeof IosAgeRangeDeclaration[keyof typeof IosAgeRangeDeclaration];

export const IosAgeRangeStatus = {
  "Sharing": "SHARING",
  "DeclinedSharing": "DECLINED_SHARING",
  "NotAvailable": "NOT_AVAILABLE",
  "DeclinedOnboarding": "DECLINED_ONBOARDING",
  "InvalidAccount": "INVALID_ACCOUNT",
  "Unrecognized": "UNRECOGNIZED"
} as const;
export type IosAgeRangeStatus = typeof IosAgeRangeStatus[keyof typeof IosAgeRangeStatus];

export const IosParentalControl = {
  "CommunicationLimits": "COMMUNICATION_LIMITS",
  "SignificantAppChangeApprovalRequired": "SIGNIFICANT_APP_CHANGE_APPROVAL_REQUIRED",
  "Unrecognized": "UNRECOGNIZED"
} as const;
export type IosParentalControl = typeof IosParentalControl[keyof typeof IosParentalControl];

export const IosRegulatoryFeature = {
  "DeclaredAgeRangeRequired": "DECLARED_AGE_RANGE_REQUIRED",
  "SignificantAppChangeRequiresParentalConsent": "SIGNIFICANT_APP_CHANGE_REQUIRES_PARENTAL_CONSENT",
  "SignificantAppChangeRequiresAdultNotification": "SIGNIFICANT_APP_CHANGE_REQUIRES_ADULT_NOTIFICATION",
  "Unrecognized": "UNRECOGNIZED"
} as const;
export type IosRegulatoryFeature = typeof IosRegulatoryFeature[keyof typeof IosRegulatoryFeature];

export const LabsPlotModerationDecision = {
  "Published": "PUBLISHED",
  "Rejected": "REJECTED",
  "Filtered": "FILTERED",
  "HardDeleted": "HARD_DELETED"
} as const;
export type LabsPlotModerationDecision = typeof LabsPlotModerationDecision[keyof typeof LabsPlotModerationDecision];

export const Language = {
  "Korean": "KOREAN",
  "Japanese": "JAPANESE",
  "English": "ENGLISH"
} as const;
export type Language = typeof Language[keyof typeof Language];

export const LorebookPlotOrderByProperty = {
  "ConnectedAt": "CONNECTED_AT",
  "UpdatedAt": "UPDATED_AT",
  "InteractionCount": "INTERACTION_COUNT"
} as const;
export type LorebookPlotOrderByProperty = typeof LorebookPlotOrderByProperty[keyof typeof LorebookPlotOrderByProperty];

export const LorebookSearchOrder = {
  "Latest": "LATEST",
  "Popular": "POPULAR"
} as const;
export type LorebookSearchOrder = typeof LorebookSearchOrder[keyof typeof LorebookSearchOrder];

export const LorebookStatus = {
  "Release": "RELEASE",
  "Filtered": "FILTERED",
  "Deleted": "DELETED",
  "HardDeleted": "HARD_DELETED"
} as const;
export type LorebookStatus = typeof LorebookStatus[keyof typeof LorebookStatus];

export const MessageSnapshotImageStatus = {
  "Progress": "PROGRESS",
  "Success": "SUCCESS",
  "Failed": "FAILED",
  "Abusing": "ABUSING",
  "Deleted": "DELETED"
} as const;
export type MessageSnapshotImageStatus = typeof MessageSnapshotImageStatus[keyof typeof MessageSnapshotImageStatus];

export const MinigameEntryStatus = {
  "Waiting": "WAITING",
  "Matched": "MATCHED",
  "Cancelled": "CANCELLED",
  "Expired": "EXPIRED"
} as const;
export type MinigameEntryStatus = typeof MinigameEntryStatus[keyof typeof MinigameEntryStatus];

export const Mood = {
  "Romance": "ROMANCE",
  "Healing": "HEALING",
  "Angst": "ANGST",
  "Yandere": "YANDERE",
  "Fantasy": "FANTASY",
  "Action": "ACTION",
  "Mystery": "MYSTERY",
  "Horror": "HORROR"
} as const;
export type Mood = typeof Mood[keyof typeof Mood];

export const NudgeType = {
  "GenerateSpeed": "GENERATE_SPEED",
  "RemoveAd": "REMOVE_AD",
  "BackgroundImage": "BACKGROUND_IMAGE",
  "PrivatePlot": "PRIVATE_PLOT"
} as const;
export type NudgeType = typeof NudgeType[keyof typeof NudgeType];

export const OpenStoreProductApiType = {
  "InApp": "IN_APP",
  "Subscription": "SUBSCRIPTION"
} as const;
export type OpenStoreProductApiType = typeof OpenStoreProductApiType[keyof typeof OpenStoreProductApiType];

export const OpenStoreType = {
  "PlayStore": "PLAY_STORE",
  "AppStore": "APP_STORE",
  "ZetaStore": "ZETA_STORE",
  "PlayStoreGlobal": "PLAY_STORE_GLOBAL",
  "AppStoreGlobal": "APP_STORE_GLOBAL",
  "ZetaStoreGlobal": "ZETA_STORE_GLOBAL"
} as const;
export type OpenStoreType = typeof OpenStoreType[keyof typeof OpenStoreType];

export const OrderByDirection = {
  "Asc": "ASC",
  "Desc": "DESC"
} as const;
export type OrderByDirection = typeof OrderByDirection[keyof typeof OrderByDirection];

export const Pacing = {
  "Fast": "FAST",
  "Natural": "NATURAL",
  "Slow": "SLOW"
} as const;
export type Pacing = typeof Pacing[keyof typeof Pacing];

export const PaymentMethodType = {
  "Card": "CARD",
  "Account": "ACCOUNT"
} as const;
export type PaymentMethodType = typeof PaymentMethodType[keyof typeof PaymentMethodType];

export const PlotCommentSort = {
  "Popular": "POPULAR",
  "Latest": "LATEST"
} as const;
export type PlotCommentSort = typeof PlotCommentSort[keyof typeof PlotCommentSort];

export const PlotCommentWindowStatus = {
  "On": "ON",
  "Off": "OFF"
} as const;
export type PlotCommentWindowStatus = typeof PlotCommentWindowStatus[keyof typeof PlotCommentWindowStatus];

export const PlotFeature = {
  "Facial": "FACIAL",
  "Voice": "VOICE",
  "Skin": "SKIN",
  "ChatSnapshotImage": "CHAT_SNAPSHOT_IMAGE",
  "OpenaiRpg": "OPENAI_RPG",
  "Unlimited": "UNLIMITED",
  "EventSpecialCurationPayback": "EVENT_SPECIAL_CURATION_PAYBACK",
  "HalloweenPluginSkin2026": "HALLOWEEN_PLUGIN_SKIN_2026"
} as const;
export type PlotFeature = typeof PlotFeature[keyof typeof PlotFeature];

export const PlotFirstImpressionSurveyReason = {
  "Setting": "SETTING",
  "Character": "CHARACTER",
  "FirstScene": "FIRST_SCENE",
  "Image": "IMAGE",
  "Introduction": "INTRODUCTION",
  "UncomfortableExpression": "UNCOMFORTABLE_EXPRESSION",
  "HardToUnderstand": "HARD_TO_UNDERSTAND",
  "TasteMismatch": "TASTE_MISMATCH",
  "Other": "OTHER"
} as const;
export type PlotFirstImpressionSurveyReason = typeof PlotFirstImpressionSurveyReason[keyof typeof PlotFirstImpressionSurveyReason];

export const PlotLikeRelation = {
  "None": "NONE",
  "Following": "FOLLOWING",
  "FollowedBy": "FOLLOWED_BY",
  "Mutual": "MUTUAL"
} as const;
export type PlotLikeRelation = typeof PlotLikeRelation[keyof typeof PlotLikeRelation];

export const PlotMode = {
  "StoryChat": "STORY_CHAT",
  "VisualNovel": "VISUAL_NOVEL"
} as const;
export type PlotMode = typeof PlotMode[keyof typeof PlotMode];

export const PlotOrderByProperty = {
  "CreatedAt": "CREATED_AT",
  "UpdatedAt": "UPDATED_AT",
  "ReleasedAt": "RELEASED_AT",
  "InteractionCount": "INTERACTION_COUNT",
  "InteractionCountWithRegen": "INTERACTION_COUNT_WITH_REGEN"
} as const;
export type PlotOrderByProperty = typeof PlotOrderByProperty[keyof typeof PlotOrderByProperty];

export const PlotReleaseNudgeLandingType = {
  "Draft": "DRAFT",
  "Private": "PRIVATE"
} as const;
export type PlotReleaseNudgeLandingType = typeof PlotReleaseNudgeLandingType[keyof typeof PlotReleaseNudgeLandingType];

export const PlotSearchOrder = {
  "Latest": "LATEST",
  "Recommended": "RECOMMENDED",
  "MaleRecommended": "MALE_RECOMMENDED",
  "FemaleRecommended": "FEMALE_RECOMMENDED"
} as const;
export type PlotSearchOrder = typeof PlotSearchOrder[keyof typeof PlotSearchOrder];

export const PlotSearchSource = {
  "PlotCard": "PLOT_CARD",
  "PlotProfile": "PLOT_PROFILE",
  "AutoComplete": "AUTO_COMPLETE",
  "Recommend": "RECOMMEND",
  "Recent": "RECENT",
  "Related": "RELATED"
} as const;
export type PlotSearchSource = typeof PlotSearchSource[keyof typeof PlotSearchSource];

export const PlotStatus = {
  "Release": "RELEASE",
  "Prerelease": "PRERELEASE",
  "Filtered": "FILTERED",
  "Deleted": "DELETED",
  "HardDeleted": "HARD_DELETED"
} as const;
export type PlotStatus = typeof PlotStatus[keyof typeof PlotStatus];

export const PlotUnlimitedDisabledReason = {
  "Minor": "MINOR",
  "AmbiguousAge": "AMBIGUOUS_AGE",
  "Selfharm": "SELFHARM",
  "Realistic": "REALISTIC",
  "Keyword": "KEYWORD",
  "Etc": "ETC"
} as const;
export type PlotUnlimitedDisabledReason = typeof PlotUnlimitedDisabledReason[keyof typeof PlotUnlimitedDisabledReason];

export const PlotUnlimitedMonitoringStatus = {
  "NotRequested": "NOT_REQUESTED",
  "Pending": "PENDING",
  "Completed": "COMPLETED"
} as const;
export type PlotUnlimitedMonitoringStatus = typeof PlotUnlimitedMonitoringStatus[keyof typeof PlotUnlimitedMonitoringStatus];

export const PluginChipKind = {
  "Default": "DEFAULT",
  "ColoredGold": "COLORED_GOLD"
} as const;
export type PluginChipKind = typeof PluginChipKind[keyof typeof PluginChipKind];

export const PointOfView = {
  "FirstPerson": "FIRST_PERSON",
  "SecondPerson": "SECOND_PERSON",
  "ThirdPerson": "THIRD_PERSON"
} as const;
export type PointOfView = typeof PointOfView[keyof typeof PointOfView];

export const PolicyType = {
  "Privacy": "PRIVACY",
  "Terms": "TERMS",
  "PrivacyAgreement": "PRIVACY_AGREEMENT"
} as const;
export type PolicyType = typeof PolicyType[keyof typeof PolicyType];

export const ProductType = {
  "CoinBundle": "COIN_BUNDLE",
  "Package": "PACKAGE",
  "AutoPaymentCoinBundle": "AUTO_PAYMENT_COIN_BUNDLE",
  "Subscription": "SUBSCRIPTION",
  "OneDayPass": "ONE_DAY_PASS"
} as const;
export type ProductType = typeof ProductType[keyof typeof ProductType];

export const ProviderType = {
  "Internal": "INTERNAL",
  "Anthropic": "ANTHROPIC",
  "Bedrock": "BEDROCK",
  "Google": "GOOGLE",
  "Azure": "AZURE",
  "Openrouter": "OPENROUTER",
  "Byteplus": "BYTEPLUS",
  "VertexAi": "VERTEX_AI",
  "Zai": "ZAI",
  "Deepseek": "DEEPSEEK",
  "AzureDatabricks": "AZURE_DATABRICKS",
  "AzureDatabricksMlflow": "AZURE_DATABRICKS_MLFLOW",
  "Unknown": "UNKNOWN"
} as const;
export type ProviderType = typeof ProviderType[keyof typeof ProviderType];

export const PurchaseStatus = {
  "Requested": "REQUESTED",
  "Charged": "CHARGED",
  "Refunded": "REFUNDED",
  "Cancelled": "CANCELLED",
  "Failed": "FAILED"
} as const;
export type PurchaseStatus = typeof PurchaseStatus[keyof typeof PurchaseStatus];

export const PushMessagePreprocessType = {
  "RemoveMarkdown": "REMOVE_MARKDOWN",
  "PlotDefaultTemplate": "PLOT_DEFAULT_TEMPLATE"
} as const;
export type PushMessagePreprocessType = typeof PushMessagePreprocessType[keyof typeof PushMessagePreprocessType];

export const PushType = {
  "NewUser": "NEW_USER",
  "OldUser": "OLD_USER",
  "ZetaBotPush": "ZETA_BOT_PUSH",
  "NextDay": "NEXT_DAY",
  "CreatorFollow": "CREATOR_FOLLOW",
  "PlotComment": "PLOT_COMMENT",
  "PlotLike": "PLOT_LIKE",
  "ContestCheer": "CONTEST_CHEER",
  "CreationStamp": "CREATION_STAMP",
  "FollowNewPlot": "FOLLOW_NEW_PLOT",
  "FollowNewFeedPost": "FOLLOW_NEW_FEED_POST",
  "FeedPostComment": "FEED_POST_COMMENT",
  "FeedPostLike": "FEED_POST_LIKE",
  "FeedPollClosed": "FEED_POLL_CLOSED",
  "Announcement": "ANNOUNCEMENT",
  "NewRecommendPlot": "NEW_RECOMMEND_PLOT",
  "Marketing": "MARKETING",
  "DailyQuizPush": "DAILY_QUIZ_PUSH",
  "PlotFiltered": "PLOT_FILTERED",
  "PlotFilteredRestored": "PLOT_FILTERED_RESTORED",
  "UnlimitedReviewResult": "UNLIMITED_REVIEW_RESULT",
  "ZlabsPlotModeration": "ZLABS_PLOT_MODERATION",
  "ZlabsFollowNewPlot": "ZLABS_FOLLOW_NEW_PLOT",
  "PlotRanking": "PLOT_RANKING",
  "PlotMilestone": "PLOT_MILESTONE",
  "Frame4cut": "FRAME_4CUT",
  "HalloweenBattleReward": "HALLOWEEN_BATTLE_REWARD",
  "HalloweenCreatorAward": "HALLOWEEN_CREATOR_AWARD",
  "ZetaPassExpirationNudge": "ZETA_PASS_EXPIRATION_NUDGE",
  "ZetaPassPromotionConsentNudge": "ZETA_PASS_PROMOTION_CONSENT_NUDGE",
  "ZetaPassDayBeforeRenewalReminder": "ZETA_PASS_DAY_BEFORE_RENEWAL_REMINDER",
  "TrickOrTreatPrizeWin": "TRICK_OR_TREAT_PRIZE_WIN",
  "TrickOrTreatInviteReward": "TRICK_OR_TREAT_INVITE_REWARD",
  "TrickOrTreatDaily": "TRICK_OR_TREAT_DAILY",
  "TrickOrTreatDrawResult": "TRICK_OR_TREAT_DRAW_RESULT"
} as const;
export type PushType = typeof PushType[keyof typeof PushType];

export const QuizAgeGroup = {
  "Age10": "AGE_10",
  "Age20": "AGE_20"
} as const;
export type QuizAgeGroup = typeof QuizAgeGroup[keyof typeof QuizAgeGroup];

export const QuizCountType = {
  "Interaction": "INTERACTION",
  "User": "USER"
} as const;
export type QuizCountType = typeof QuizCountType[keyof typeof QuizCountType];

export const QuizGender = {
  "Male": "MALE",
  "Female": "FEMALE"
} as const;
export type QuizGender = typeof QuizGender[keyof typeof QuizGender];

export const QuizPeriodType = {
  "Day": "DAY",
  "Week": "WEEK"
} as const;
export type QuizPeriodType = typeof QuizPeriodType[keyof typeof QuizPeriodType];

export const RankingFilterType = {
  "Hashtag": "HASHTAG",
  "RecentReleaseDays": "RECENT_RELEASE_DAYS",
  "Genre": "GENRE"
} as const;
export type RankingFilterType = typeof RankingFilterType[keyof typeof RankingFilterType];

export const RankingGender = {
  "Male": "MALE",
  "Female": "FEMALE",
  "All": "ALL"
} as const;
export type RankingGender = typeof RankingGender[keyof typeof RankingGender];

export const RankingType = {
  "RealtimeRerank": "REALTIME_RERANK",
  "Realtime": "REALTIME",
  "Daily": "DAILY",
  "Weekly": "WEEKLY",
  "Monthly": "MONTHLY",
  "New": "NEW",
  "Trending": "TRENDING",
  "Best": "BEST",
  "Global": "GLOBAL"
} as const;
export type RankingType = typeof RankingType[keyof typeof RankingType];

export const RateChatSnapshotImageRequestReact = {
  "Like": "LIKE",
  "Dislike": "DISLIKE",
  "Cancel": "CANCEL"
} as const;
export type RateChatSnapshotImageRequestReact = typeof RateChatSnapshotImageRequestReact[keyof typeof RateChatSnapshotImageRequestReact];

export const RateGeneratedCharacterImageRequestReact = {
  "Like": "LIKE",
  "Dislike": "DISLIKE",
  "Cancel": "CANCEL"
} as const;
export type RateGeneratedCharacterImageRequestReact = typeof RateGeneratedCharacterImageRequestReact[keyof typeof RateGeneratedCharacterImageRequestReact];

export const RedemptionCodeType = {
  "Coin": "COIN",
  "SubscriptionPeriod": "SUBSCRIPTION_PERIOD"
} as const;
export type RedemptionCodeType = typeof RedemptionCodeType[keyof typeof RedemptionCodeType];

export const ReportCharacterProfileImageGenerationResultRequestType = {
  "Sexual": "SEXUAL",
  "Violence": "VIOLENCE",
  "ChildAbuse": "CHILD_ABUSE",
  "Discrimination": "DISCRIMINATION",
  "Disgusting": "DISGUSTING",
  "Quality": "QUALITY"
} as const;
export type ReportCharacterProfileImageGenerationResultRequestType = typeof ReportCharacterProfileImageGenerationResultRequestType[keyof typeof ReportCharacterProfileImageGenerationResultRequestType];

export const ReportChatSnapshotImageRequestType = {
  "Sexual": "SEXUAL",
  "Violence": "VIOLENCE",
  "ChildAbuse": "CHILD_ABUSE",
  "Discrimination": "DISCRIMINATION",
  "Disgusting": "DISGUSTING",
  "Quality": "QUALITY"
} as const;
export type ReportChatSnapshotImageRequestType = typeof ReportChatSnapshotImageRequestType[keyof typeof ReportChatSnapshotImageRequestType];

export const ReportType = {
  "ImproperForUnlimited": "IMPROPER_FOR_UNLIMITED",
  "Sexual": "SEXUAL",
  "GroupHatred": "GROUP_HATRED",
  "Violence": "VIOLENCE",
  "Disgusting": "DISGUSTING",
  "IntellectualProperty": "INTELLECTUAL_PROPERTY",
  "Rumor": "RUMOR",
  "SelfInjury": "SELF_INJURY",
  "Privacy": "PRIVACY",
  "Spam": "SPAM",
  "Etc": "ETC",
  "ImproperBackgroundAudio": "IMPROPER_BACKGROUND_AUDIO"
} as const;
export type ReportType = typeof ReportType[keyof typeof ReportType];

export const ResponseLength = {
  "Short": "SHORT",
  "Medium": "MEDIUM",
  "Long": "LONG",
  "Dynamic": "DYNAMIC"
} as const;
export type ResponseLength = typeof ResponseLength[keyof typeof ResponseLength];

export const RoomFeature = {
  "CustomRegen": "CUSTOM_REGEN"
} as const;
export type RoomFeature = typeof RoomFeature[keyof typeof RoomFeature];

export const RoomOrderByProperty = {
  "LastMessageTime": "LAST_MESSAGE_TIME",
  "UpdatedAt": "UPDATED_AT"
} as const;
export type RoomOrderByProperty = typeof RoomOrderByProperty[keyof typeof RoomOrderByProperty];

export const SceneInfoBoxItemType = {
  "Time": "TIME",
  "Date": "DATE",
  "Location": "LOCATION",
  "Weather": "WEATHER",
  "Situation": "SITUATION"
} as const;
export type SceneInfoBoxItemType = typeof SceneInfoBoxItemType[keyof typeof SceneInfoBoxItemType];

export const ScrappedPlotOrderByProperty = {
  "ScrappedAt": "SCRAPPED_AT"
} as const;
export type ScrappedPlotOrderByProperty = typeof ScrappedPlotOrderByProperty[keyof typeof ScrappedPlotOrderByProperty];

export const SenderType = {
  "User": "USER",
  "Bot": "BOT",
  "System": "SYSTEM"
} as const;
export type SenderType = typeof SenderType[keyof typeof SenderType];

export const ServicePlatform = {
  "Zeta": "ZETA"
} as const;
export type ServicePlatform = typeof ServicePlatform[keyof typeof ServicePlatform];

export const SpeakerConvention = {
  "MultiSpeaker": "MULTI_SPEAKER",
  "CommandTag": "COMMAND_TAG"
} as const;
export type SpeakerConvention = typeof SpeakerConvention[keyof typeof SpeakerConvention];

export const SpeakerPosition = {
  "Left": "LEFT",
  "Right": "RIGHT",
  "Narrator": "NARRATOR"
} as const;
export type SpeakerPosition = typeof SpeakerPosition[keyof typeof SpeakerPosition];

export const StatDuration = {
  "Week": "WEEK",
  "Month": "MONTH"
} as const;
export type StatDuration = typeof StatDuration[keyof typeof StatDuration];

export const StorytellingStyle = {
  "JaneAusten": "JANE_AUSTEN",
  "DonWinslow": "DON_WINSLOW",
  "HenryMiller": "HENRY_MILLER",
  "LouisaMayAlcott": "LOUISA_MAY_ALCOTT",
  "QuentinTarantino": "QUENTIN_TARANTINO",
  "JkRowling": "JK_ROWLING",
  "NisioIsin": "NISIO_ISIN",
  "StephenKing": "STEPHEN_KING"
} as const;
export type StorytellingStyle = typeof StorytellingStyle[keyof typeof StorytellingStyle];

export const SupportCategoryDisplayType = {
  "Dropdown": "DROPDOWN",
  "Buttons": "BUTTONS"
} as const;
export type SupportCategoryDisplayType = typeof SupportCategoryDisplayType[keyof typeof SupportCategoryDisplayType];

export const SupportCategoryType = {
  "All": "ALL",
  "ContactAndTemplateOnly": "CONTACT_AND_TEMPLATE_ONLY",
  "ContactOnly": "CONTACT_ONLY",
  "TemplateOnly": "TEMPLATE_ONLY",
  "FaqOnly": "FAQ_ONLY",
  "FaqAndTemplateOnly": "FAQ_AND_TEMPLATE_ONLY",
  "Disabled": "DISABLED"
} as const;
export type SupportCategoryType = typeof SupportCategoryType[keyof typeof SupportCategoryType];

export const Tense = {
  "Past": "PAST",
  "Present": "PRESENT"
} as const;
export type Tense = typeof Tense[keyof typeof Tense];

export const TestPlotKeywordType = {
  "AbusingPlotPrompt": "ABUSING_PLOT_PROMPT",
  "AbusingPlotHashtag": "ABUSING_PLOT_HASHTAG"
} as const;
export type TestPlotKeywordType = typeof TestPlotKeywordType[keyof typeof TestPlotKeywordType];

export const TextAbusingType = {
  "Sexual": "SEXUAL",
  "Bias": "BIAS",
  "Violence": "VIOLENCE",
  "Politics": "POLITICS",
  "Tobacco": "TOBACCO",
  "Alcohol": "ALCOHOL",
  "Drugs": "DRUGS",
  "Gamble": "GAMBLE",
  "Crime": "CRIME",
  "KoreanTest": "KOREAN_TEST",
  "V2": "V2",
  "SelfHarm": "SELF_HARM"
} as const;
export type TextAbusingType = typeof TextAbusingType[keyof typeof TextAbusingType];

export const TokenIssuer = {
  "Google": "GOOGLE",
  "Kakao": "KAKAO",
  "Facebook": "FACEBOOK",
  "Line": "LINE",
  "Apple": "APPLE",
  "InternalAccess": "INTERNAL_ACCESS"
} as const;
export type TokenIssuer = typeof TokenIssuer[keyof typeof TokenIssuer];

export const TossDirectPaymentMethodCode = {
  "Tosspay": "TOSSPAY",
  "Kakaopay": "KAKAOPAY",
  "Card": "CARD",
  "Transfer": "TRANSFER"
} as const;
export type TossDirectPaymentMethodCode = typeof TossDirectPaymentMethodCode[keyof typeof TossDirectPaymentMethodCode];

export const TossPaymentsPaymentType = {
  "Normal": "NORMAL",
  "Billing": "BILLING",
  "Brandpay": "BRANDPAY"
} as const;
export type TossPaymentsPaymentType = typeof TossPaymentsPaymentType[keyof typeof TossPaymentsPaymentType];

export const TrickOrTreatGiftCardTier = {
  "High": "HIGH",
  "Mid": "MID",
  "Low": "LOW"
} as const;
export type TrickOrTreatGiftCardTier = typeof TrickOrTreatGiftCardTier[keyof typeof TrickOrTreatGiftCardTier];

export const TrickOrTreatGiftType = {
  "Piece": "PIECE",
  "Jackpot": "JACKPOT",
  "GiftCard": "GIFT_CARD"
} as const;
export type TrickOrTreatGiftType = typeof TrickOrTreatGiftType[keyof typeof TrickOrTreatGiftType];

export const TrickOrTreatPlayStatus = {
  "AwaitingMessage": "AWAITING_MESSAGE",
  "Granted": "GRANTED",
  "Pending": "PENDING",
  "Expired": "EXPIRED",
  "Forfeited": "FORFEITED",
  "NoGift": "NO_GIFT"
} as const;
export type TrickOrTreatPlayStatus = typeof TrickOrTreatPlayStatus[keyof typeof TrickOrTreatPlayStatus];

export const TrickOrTreatPrize = {
  "Iphone": "IPHONE",
  "Switch": "SWITCH",
  "GiftCard": "GIFT_CARD"
} as const;
export type TrickOrTreatPrize = typeof TrickOrTreatPrize[keyof typeof TrickOrTreatPrize];

export const UpdatePlotStatusRequestStatus = {
  "Release": "RELEASE",
  "Delete": "DELETE"
} as const;
export type UpdatePlotStatusRequestStatus = typeof UpdatePlotStatusRequestStatus[keyof typeof UpdatePlotStatusRequestStatus];

export const UsageVoucherKind = {
  "ChatTurn": "CHAT_TURN",
  "PlotImageGeneration": "PLOT_IMAGE_GENERATION",
  "ZetaPass": "ZETA_PASS",
  "AdFree": "AD_FREE"
} as const;
export type UsageVoucherKind = typeof UsageVoucherKind[keyof typeof UsageVoucherKind];

export const UsageVoucherStatus = {
  "Available": "AVAILABLE",
  "Active": "ACTIVE",
  "Used": "USED",
  "Expired": "EXPIRED"
} as const;
export type UsageVoucherStatus = typeof UsageVoucherStatus[keyof typeof UsageVoucherStatus];

export const UserContactStatusFilter = {
  "Pending": "PENDING",
  "Completed": "COMPLETED",
  "Closed": "CLOSED"
} as const;
export type UserContactStatusFilter = typeof UserContactStatusFilter[keyof typeof UserContactStatusFilter];

export const UserPushType = {
  "PlotMessage": "PLOT_MESSAGE",
  "NewRecommendPlot": "NEW_RECOMMEND_PLOT",
  "CreatorFollow": "CREATOR_FOLLOW",
  "CreatorNewPlot": "CREATOR_NEW_PLOT",
  "CreatorNewFeedPost": "CREATOR_NEW_FEED_POST",
  "CreatorFeedLike": "CREATOR_FEED_LIKE",
  "CreatorFeedPollClosed": "CREATOR_FEED_POLL_CLOSED",
  "LorebookUpdated": "LOREBOOK_UPDATED",
  "LorebookDeleted": "LOREBOOK_DELETED",
  "UnlimitedReview": "UNLIMITED_REVIEW",
  "PlotFiltered": "PLOT_FILTERED",
  "PlotModeration": "PLOT_MODERATION",
  "SocialProfileModeration": "SOCIAL_PROFILE_MODERATION",
  "Comment": "COMMENT",
  "PlotComment": "PLOT_COMMENT",
  "PlotLike": "PLOT_LIKE",
  "PlotRanking": "PLOT_RANKING",
  "PlotMilestone": "PLOT_MILESTONE",
  "CommentModeration": "COMMENT_MODERATION",
  "FeedPostModeration": "FEED_POST_MODERATION",
  "FavoriteStory": "FAVORITE_STORY",
  "UsefulMessage": "USEFUL_MESSAGE",
  "Announcement": "ANNOUNCEMENT",
  "Payment": "PAYMENT",
  "ZetaPass": "ZETA_PASS"
} as const;
export type UserPushType = typeof UserPushType[keyof typeof UserPushType];

export const VoiceAgeGroup = {
  "Child": "CHILD",
  "YoungAdult": "YOUNG_ADULT",
  "MiddleAged": "MIDDLE_AGED",
  "Elder": "ELDER"
} as const;
export type VoiceAgeGroup = typeof VoiceAgeGroup[keyof typeof VoiceAgeGroup];

export const WebRefundRequestItemStatus = {
  "Pending": "PENDING",
  "RefundRequested": "REFUND_REQUESTED",
  "Rejected": "REJECTED",
  "Refunded": "REFUNDED",
  "RefundFailed": "REFUND_FAILED"
} as const;
export type WebRefundRequestItemStatus = typeof WebRefundRequestItemStatus[keyof typeof WebRefundRequestItemStatus];

export const WebRefundRequestStatus = {
  "Pending": "PENDING",
  "Rejected": "REJECTED",
  "Refunded": "REFUNDED",
  "PartiallyRefunded": "PARTIALLY_REFUNDED",
  "Cancelled": "CANCELLED",
  "RefundFailed": "REFUND_FAILED"
} as const;
export type WebRefundRequestStatus = typeof WebRefundRequestStatus[keyof typeof WebRefundRequestStatus];

export const WithdrawalReportType = {
  "ForInitializeUser": "FOR_INITIALIZE_USER",
  "ForPrivacy": "FOR_PRIVACY",
  "NotInterested": "NOT_INTERESTED",
  "Etc": "ETC",
  "ByAdmin": "BY_ADMIN"
} as const;
export type WithdrawalReportType = typeof WithdrawalReportType[keyof typeof WithdrawalReportType];

export const ZetaPassPlatform = {
  "Brandpay": "BRANDPAY",
  "TossPayments": "TOSS_PAYMENTS",
  "CodaPay": "CODA_PAY",
  "AppStore": "APP_STORE",
  "PlayStore": "PLAY_STORE",
  "Admin": "ADMIN",
  "Voucher": "VOUCHER"
} as const;
export type ZetaPassPlatform = typeof ZetaPassPlatform[keyof typeof ZetaPassPlatform];

export const ZetaPassPromotionConsentStatus = {
  "None": "NONE",
  "ConsentPending": "CONSENT_PENDING",
  "Consented": "CONSENTED"
} as const;
export type ZetaPassPromotionConsentStatus = typeof ZetaPassPromotionConsentStatus[keyof typeof ZetaPassPromotionConsentStatus];

export const ZetaPassRedeemBlockedReason = {
  "Subscription": "SUBSCRIPTION",
  "OneDayPass": "ONE_DAY_PASS",
  "ProTier": "PRO_TIER"
} as const;
export type ZetaPassRedeemBlockedReason = typeof ZetaPassRedeemBlockedReason[keyof typeof ZetaPassRedeemBlockedReason];

export const ZetaPassRenewalReminderTiming = {
  "ThreeDaysBefore": "THREE_DAYS_BEFORE",
  "OneDayBefore": "ONE_DAY_BEFORE"
} as const;
export type ZetaPassRenewalReminderTiming = typeof ZetaPassRenewalReminderTiming[keyof typeof ZetaPassRenewalReminderTiming];

export const ZetaPassSubscriptionStatus = {
  "Active": "ACTIVE",
  "CancellationPending": "CANCELLATION_PENDING",
  "Expired": "EXPIRED"
} as const;
export type ZetaPassSubscriptionStatus = typeof ZetaPassSubscriptionStatus[keyof typeof ZetaPassSubscriptionStatus];

export const ZLabsFeatureCondition = {
  "Dice": "DICE",
  "Costume": "COSTUME"
} as const;
export type ZLabsFeatureCondition = typeof ZLabsFeatureCondition[keyof typeof ZLabsFeatureCondition];

export const ZLabsPlotSearchOrder = {
  "Recommended": "RECOMMENDED",
  "Latest": "LATEST"
} as const;
export type ZLabsPlotSearchOrder = typeof ZLabsPlotSearchOrder[keyof typeof ZLabsPlotSearchOrder];

export const ZwitterMessageSort = {
  "Latest": "LATEST",
  "Popular": "POPULAR",
  "Newest": "NEWEST",
  "Oldest": "OLDEST",
  "LikesDesc": "LIKES_DESC",
  "LikesAsc": "LIKES_ASC"
} as const;
export type ZwitterMessageSort = typeof ZwitterMessageSort[keyof typeof ZwitterMessageSort];
