# WSDL Operation Coverage

Status: generated from official production WSDL/XSD artifacts.

| Metric | Value |
|---|---:|
| WSDL operations discovered | 45 |
| Raw methods generated | 45 |
| High-level wrappers complete | 45 |
| Contract fixtures | 45 |
| Raw operation coverage | 100% |
| High-level coverage | 100% |

| Service | Operation | Endpoint | Raw | High-level | Fixture | Test |
|---|---|---|---:|---:|---:|---:|
| DataBoxAccess | `GetOwnerInfoFromLogin` | info | yes | yes | yes | yes |
| DataBoxAccess | `GetOwnerInfoFromLogin2` | info | yes | yes | yes | yes |
| DataBoxAccess | `GetUserInfoFromLogin` | info | yes | yes | yes | yes |
| DataBoxAccess | `GetUserInfoFromLogin2` | info | yes | yes | yes | yes |
| DataBoxAccess | `ChangeISDSPassword` | info | yes | yes | yes | yes |
| DataBoxAccess | `GetPasswordInfo` | info | yes | yes | yes | yes |
| DataBoxSearch | `FindDataBox` | search | yes | yes | yes | yes |
| DataBoxSearch | `FindDataBox2` | search | yes | yes | yes | yes |
| DataBoxSearch | `CheckDataBox` | search | yes | yes | yes | yes |
| DataBoxSearch | `GetDataBoxList` | search | yes | yes | yes | yes |
| DataBoxSearch | `PDZInfo` | search | yes | yes | yes | yes |
| DataBoxSearch | `DataBoxCreditInfo` | search | yes | yes | yes | yes |
| DataBoxSearch | `ISDSSearch2` | search | yes | yes | yes | yes |
| DataBoxSearch | `ISDSSearch3` | search | yes | yes | yes | yes |
| DataBoxSearch | `GetDataBoxActivityStatus` | search | yes | yes | yes | yes |
| DataBoxSearch | `FindPersonalDataBox` | search | yes | yes | yes | yes |
| DataBoxSearch | `DTInfo` | search | yes | yes | yes | yes |
| DataBoxSearch | `PDZSendInfo` | search | yes | yes | yes | yes |
| DataBoxSearch | `GetConstants` | search | yes | yes | yes | yes |
| DataBoxSearch | `GetDataBoxAddress` | search | yes | yes | yes | yes |
| dmInfoWebService | `VerifyMessage` | messages | yes | yes | yes | yes |
| dmInfoWebService | `MessageEnvelopeDownload` | messages | yes | yes | yes | yes |
| dmInfoWebService | `MarkMessageAsDownloaded` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetDeliveryInfo` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetSignedDeliveryInfo` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetListOfSentMessages` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetListOfReceivedMessages` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetMessageStateChanges` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetMessageAuthor` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetMessageAuthor2` | messages | yes | yes | yes | yes |
| dmInfoWebService | `EraseMessage` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetListOfErasedMessages` | messages | yes | yes | yes | yes |
| dmInfoWebService | `PickUpAsyncResponse` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetListForNotifications` | messages | yes | yes | yes | yes |
| dmInfoWebService | `RegisterForNotifications` | messages | yes | yes | yes | yes |
| dmInfoWebService | `SentMessageEnvelopeDownload` | messages | yes | yes | yes | yes |
| dmInfoWebService | `SuspMessageReport` | messages | yes | yes | yes | yes |
| dmOperationsWebService | `CreateMessage` | messages | yes | yes | yes | yes |
| dmOperationsWebService | `MessageDownload` | messages | yes | yes | yes | yes |
| dmOperationsWebService | `SignedMessageDownload` | messages | yes | yes | yes | yes |
| dmOperationsWebService | `SignedSentMessageDownload` | messages | yes | yes | yes | yes |
| dmOperationsWebService | `DummyOperation` | messages | yes | yes | yes | yes |
| dmOperationsWebService | `CreateMultipleMessage` | messages | yes | yes | yes | yes |
| dmOperationsWebService | `AuthenticateMessage` | messages | yes | yes | yes | yes |
| dmOperationsWebService | `Re-signISDSDocument` | messages | yes | yes | yes | yes |
