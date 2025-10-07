import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ChartOfAccountsMenu from "./components/ChartOfAccountsMenu.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Component imports
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Database from "./components/Database";
import ReminderDB from "./components/ReminderDB";
import CompanyInfoDB from "./components/CompanyInfoDB";
import CompanyProfileDB from "./components/CompanyProfileDB";
import EditCompanyProfile from "./components/EditCompanyProfile";
import CompanyInfo from "./components/CompanyInfo";
import TradeInfo from "./components/TradeInfo";
import ListingInfo from "./components/ListingInfo";
import LedgerDB from "./components/LedgerDB";
import MiscellaneousDB from "./components/MiscellaneousDB";
import TradeDB from "./components/TradeDB";
import MiscellaneousEntriesDB from "./components/MiscellaneousEntriesDB";
import MLSFeeDB from "./components/MLSFeeDB";
import EditLedger from "./components/EditLedger";
import EditMisc from "./components/EditMisc";
import ListingInfoDB from "./components/ListingInfoDB"; // Import the new component
import AgentInfo from "./components/AgentInfo";
import AgentInfoDB from "./components/AgentInfoDB";
import Finance from "./components/Finance";
import RealEstateTrustPayments from "./components/RealEstateTrustPayments";
import RealEstateTrustLedger from "./components/RealEstateTrustLedger";
import CommissionTrustPayments from "./components/CommissionTrustPayments";
import CommissionTrustLedger from "./components/CommissionTrustLedger";

import GeneralAccountPayments from "./components/GeneralAccountPayments";
import ReconcileRealEstateTrust from "./components/ReconcileRealEstateTrust";
import ReconcileCommissionTrust from "./components/ReconcileCommissionTrust";
import ReconcileGeneralAccount from "./components/ReconcileGeneralAccount";
import AccountsReceivable from "./components/AccountsReceivable";
import TrialBalance from "./components/TrialBalance";
import HSTReport from "./components/HSTReport";
import PeopleForm from "./components/PeopleForm";
import FinanceDB from "./components/FinanceDB";
import VendorInfoNew from "./components/VendorInfoNew";
import VendorInfoDB from "./components/VendorInfoDB";
import FinanceStatements from "./pages/FinanceStatements";
import AgentPaymentInfo from "./components/AgentPaymentInfo";
import JournalEntry from "./components/JournalEntry";
import DisbursementsJournals from "./components/DisbursementsJournals";
import TrustJournal from "./components/TrustJournal";
import TradeARJournal from "./components/TradeARJournal";
import FinancialReports from "./components/FinancialReports";
import FinancialReportsHST from "./components/FinancialReportsHST";
import FinancialReportsDisbursements from "./components/FinancialReportsDisbursements";
import FinancialReportsTrust from "./components/FinancialReportsTrust";
import FinancialReportsTradeAR from "./components/FinancialReportsTradeAR";
import FinancialReportsAgentSummary from "./components/FinancialReportsAgentSummary";
import FinancialReportsAgentPayment from "./components/FinancialReportsAgentsPayment";
import AgentPaymentSummary from "./components/AgentPaymentSummary";
import OutsideBrokersDB from "./components/OutsideBrokersDB";
import LawyersDB from "./components/LawyersDB";

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return <div>Loading...</div>; // Prevents premature render
  }

  return (
    <>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route
            path="/"
            element={user ? <Dashboard /> : <Login setUser={setUser} />}
          />
          <Route
            path="/database"
            element={user ? <Database /> : <Navigate to="/" replace />}
          />
          <Route
            path="/database/reminders"
            element={user ? <ReminderDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/database/company-info-db"
            element={user ? <CompanyInfoDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/company-profile-db"
            element={user ? <CompanyProfileDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/edit-company-profile"
            element={
              user ? <EditCompanyProfile /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/company-info"
            element={user ? <CompanyInfo /> : <Navigate to="/" replace />}
          />
          <Route
            path="/trade-info"
            element={
              user ? <TradeInfo user={user} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/listing-info"
            element={user ? <ListingInfo /> : <Navigate to="/" replace />}
          />
          <Route
            path="/ledger-db"
            element={user ? <LedgerDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/miscellaneous-db"
            element={user ? <MiscellaneousDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/trade-db"
            element={user ? <TradeDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/miscellaneous-entries-db"
            element={
              user ? <MiscellaneousEntriesDB /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/mls-fee-db"
            element={user ? <MLSFeeDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/edit-ledger/:id"
            element={user ? <EditLedger /> : <Navigate to="/" replace />}
          />
          <Route
            path="/edit-misc/:id"
            element={user ? <EditMisc /> : <Navigate to="/" replace />}
          />
          <Route
            path="/listing-info-db"
            element={user ? <ListingInfoDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/agent-info"
            element={user ? <AgentInfo /> : <Navigate to="/" replace />}
          />
          <Route
            path="/agent-info-db"
            element={user ? <AgentInfoDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/finance"
            element={user ? <Finance /> : <Navigate to="/" replace />}
          />
          <Route
            path="/real-estate-trust-payments"
            element={
              user ? <RealEstateTrustPayments /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/real-estate-trust-ledger"
            element={
              user ? <RealEstateTrustLedger /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/commission-trust-payments"
            element={
              user ? <CommissionTrustPayments /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/commission-trust-ledger"
            element={
              user ? <CommissionTrustLedger /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/general-account-payments"
            element={
              user ? <GeneralAccountPayments /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/chart-of-accounts"
            element={
              user ? <ChartOfAccountsMenu /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/trial-balance"
            element={user ? <TrialBalance /> : <Navigate to="/" replace />}
          />
          <Route
            path="/hst-report"
            element={user ? <HSTReport /> : <Navigate to="/" replace />}
          />
          <Route
            path="/people-form"
            element={user ? <PeopleForm /> : <Navigate to="/" replace />}
          />
          <Route
            path="/finance-db"
            element={user ? <FinanceDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/vendor-info"
            element={user ? <VendorInfoNew /> : <Navigate to="/" replace />}
          />
          <Route
            path="/vendor-info-db"
            element={user ? <VendorInfoDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/finance-statements"
            element={user ? <FinanceStatements /> : <Navigate to="/" replace />}
          />
          <Route
            path="/reconcile-real-estate-trust"
            element={
              user ? <ReconcileRealEstateTrust /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/reconcile-commission-trust"
            element={
              user ? <ReconcileCommissionTrust /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/reconcile-general-account"
            element={
              user ? <ReconcileGeneralAccount /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/accounts-receivable"
            element={
              user ? <AccountsReceivable /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/agent-payment-info"
            element={user ? <AgentPaymentInfo /> : <Navigate to="/" replace />}
          />
          <Route
            path="/agent-payment-summary"
            element={
              user ? <AgentPaymentSummary /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/journal-entry"
            element={user ? <JournalEntry /> : <Navigate to="/" replace />}
          />
          <Route
            path="/disbursements-journals"
            element={
              user ? <DisbursementsJournals /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/trust-journal"
            element={user ? <TrustJournal /> : <Navigate to="/" replace />}
          />
          <Route
            path="/trade-ar-journal"
            element={user ? <TradeARJournal /> : <Navigate to="/" replace />}
          />
          <Route
            path="/financial-reports"
            element={user ? <FinancialReports /> : <Navigate to="/" replace />}
          />
          <Route
            path="/financial-reports-hst"
            element={
              user ? <FinancialReportsHST /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/financial-reports-disbursements"
            element={
              user ? (
                <FinancialReportsDisbursements />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/financial-reports-trust"
            element={
              user ? <FinancialReportsTrust /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/financial-reports-trade-ar"
            element={
              user ? <FinancialReportsTradeAR /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/financial-reports-agent-payment"
            element={
              user ? (
                <FinancialReportsAgentPayment />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/financial-reports-agent-payment-summary"
            element={
              user ? (
                <FinancialReportsAgentSummary />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/outside-brokers-db"
            element={user ? <OutsideBrokersDB /> : <Navigate to="/" replace />}
          />
          <Route
            path="/lawyers-db"
            element={user ? <LawyersDB /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
