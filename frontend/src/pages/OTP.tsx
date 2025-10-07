import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks/use-toast';

const OTP = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createAccount, state } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (otp.length !== 6) {
        toast({
          title: "Invalid OTP",
          description: "Please enter a 6-digit OTP.",
          variant: "destructive",
        });
        return;
      }

      // Dummy OTP verification (any 6-digit code works)
      const success = createAccount();
      if (success) {
        toast({
          title: "Account Created Successfully!",
          description: "Welcome to NsutCater!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during OTP verification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            NsutCater
          </h1>
          <p className="text-muted-foreground">Enter verification code</p>
          <p className="text-sm text-muted-foreground mt-2">
            We've sent a 6-digit code to {state.accountDetails?.email}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter OTP</label>
              <div className="flex justify-center">
                <InputOTP 
                  value={otp} 
                  onChange={setOtp}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground text-center">
              Demo: Enter any 6-digit code to proceed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;