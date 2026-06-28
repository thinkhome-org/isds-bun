# WSDL Operation Coverage

Status: generated from official production WSDL/XSD artifacts.

| Metric | Value |
|---|---:|
| WSDL operations discovered | 45 |
| Raw methods generated | 45 |
| High-level wrappers complete | 1 |
| Contract fixtures | 1 |
| Raw operation coverage | 100% |
| High-level coverage | 2% |

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
| dmInfoWebService | `VerifyMessage` | messages | yes | no | no | no |
| dmInfoWebService | `MessageEnvelopeDownload` | messages | yes | no | no | no |
| dmInfoWebService | `MarkMessageAsDownloaded` | messages | yes | no | no | no |
| dmInfoWebService | `GetDeliveryInfo` | messages | yes | no | no | no |
| dmInfoWebService | `GetSignedDeliveryInfo` | messages | yes | no | no | no |
| dmInfoWebService | `GetListOfSentMessages` | messages | yes | no | no | no |
| dmInfoWebService | `GetListOfReceivedMessages` | messages | yes | yes | yes | yes |
| dmInfoWebService | `GetMessageStateChanges` | messages | yes | no | no | no |
| dmInfoWebService | `GetMessageAuthor` | messages | yes | no | no | no |
| dmInfoWebService | `GetMessageAuthor2` | messages | yes | no | no | no |
| dmInfoWebService | `EraseMessage` | messages | yes | no | no | no |
| dmInfoWebService | `GetListOfErasedMessages` | messages | yes | no | no | no |
| dmInfoWebService | `PickUpAsyncResponse` | messages | yes | no | no | no |
| dmInfoWebService | `GetListForNotifications` | messages | yes | no | no | no |
| dmInfoWebService | `RegisterForNotifications` | messages | yes | no | no | no |
| dmInfoWebService | `SentMessageEnvelopeDownload` | messages | yes | no | no | no |
| dmInfoWebService | `SuspMessageReport` | messages | yes | no | no | no |
| dmOperationsWebService | `CreateMessage` | messages | yes | no | no | no |
| dmOperationsWebService | `MessageDownload` | messages | yes | no | no | no |
| dmOperationsWebService | `SignedMessageDownload` | messages | yes | no | no | no |
| dmOperationsWebService | `SignedSentMessageDownload` | messages | yes | no | no | no |
| dmOperationsWebService | `DummyOperation` | messages | yes | no | no | no |
| dmOperationsWebService | `CreateMultipleMessage` | messages | yes | no | no | no |
| dmOperationsWebService | `AuthenticateMessage` | messages | yes | no | no | no |
| dmOperationsWebService | `Re-signISDSDocument` | messages | yes | no | no | no |
