# WSDL Operation Coverage

Status: generated from official production WSDL/XSD artifacts.

| Metric | Value |
|---|---:|
| WSDL operations discovered | 45 |
| Raw methods generated | 45 |
| High-level wrappers complete | 17 |
| Contract fixtures | 17 |
| Raw operation coverage | 100% |
| High-level coverage | 38% |

| Service | Operation | Endpoint | Raw | High-level | Fixture | Test |
|---|---|---|---:|---:|---:|---:|
| DataBoxAccess | `GetOwnerInfoFromLogin` | info | yes | no | no | no |
| DataBoxAccess | `GetOwnerInfoFromLogin2` | info | yes | no | no | no |
| DataBoxAccess | `GetUserInfoFromLogin` | info | yes | no | no | no |
| DataBoxAccess | `GetUserInfoFromLogin2` | info | yes | no | no | no |
| DataBoxAccess | `ChangeISDSPassword` | info | yes | no | no | no |
| DataBoxAccess | `GetPasswordInfo` | info | yes | no | no | no |
| DataBoxSearch | `FindDataBox` | search | yes | no | no | no |
| DataBoxSearch | `FindDataBox2` | search | yes | no | no | no |
| DataBoxSearch | `CheckDataBox` | search | yes | no | no | no |
| DataBoxSearch | `GetDataBoxList` | search | yes | no | no | no |
| DataBoxSearch | `PDZInfo` | search | yes | no | no | no |
| DataBoxSearch | `DataBoxCreditInfo` | search | yes | no | no | no |
| DataBoxSearch | `ISDSSearch2` | search | yes | no | no | no |
| DataBoxSearch | `ISDSSearch3` | search | yes | no | no | no |
| DataBoxSearch | `GetDataBoxActivityStatus` | search | yes | no | no | no |
| DataBoxSearch | `FindPersonalDataBox` | search | yes | no | no | no |
| DataBoxSearch | `DTInfo` | search | yes | no | no | no |
| DataBoxSearch | `PDZSendInfo` | search | yes | no | no | no |
| DataBoxSearch | `GetConstants` | search | yes | no | no | no |
| DataBoxSearch | `GetDataBoxAddress` | search | yes | no | no | no |
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
| dmOperationsWebService | `CreateMessage` | messages | yes | no | no | no |
| dmOperationsWebService | `MessageDownload` | messages | yes | no | no | no |
| dmOperationsWebService | `SignedMessageDownload` | messages | yes | no | no | no |
| dmOperationsWebService | `SignedSentMessageDownload` | messages | yes | no | no | no |
| dmOperationsWebService | `DummyOperation` | messages | yes | no | no | no |
| dmOperationsWebService | `CreateMultipleMessage` | messages | yes | no | no | no |
| dmOperationsWebService | `AuthenticateMessage` | messages | yes | no | no | no |
| dmOperationsWebService | `Re-signISDSDocument` | messages | yes | no | no | no |
