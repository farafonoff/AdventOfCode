import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.math.*;

/**
 * Created by faraf on 04.12.2016.
 */
     class Bruter implements Runnable{
        MessageDigest digest;
        String prefix; int start; int step;
		char result[];
        Bruter(String _prefix, int _start, int _step) throws NoSuchAlgorithmException {
            this.prefix = _prefix;
            this.start = _start;
            this.step = _step;
            digest = MessageDigest.getInstance("MD5");
			result = new char[8];
        }

        @Override
        public void run() {
			int steps = 0;
            out:for(int i=start;i<Integer.MAX_VALUE;i+=step) {
                byte[] in = (prefix+i).getBytes();
                byte[] out = digest.digest(in);
				++steps;
				//if (steps%1000==0) {
//					System.out.println(i);
				//}
                if (out[0]==0&&out[1]==0&&out[2]>=0&&out[2]<16/*&&out[2]==0*/) {
					BigInteger il = new BigInteger(1,out);
					String rhash = String.format("%1$032X", il);
					char cp = rhash.charAt(5);
					char cc = rhash.charAt(6);
					int pos = cp - '0';
					if (pos<result.length&&result[pos]==0) {
						result[pos] = cc;
					}
					System.out.print(i);
					System.out.print("\t");
					System.out.println(new String(result));
				}
            }
        }
    }

	
public class Puzzle05_2 {
    public static void main(String[] args) throws NoSuchAlgorithmException {
		/*byte[] test = MessageDigest.getInstance("MD5").digest("abcdef609043".getBytes());
		for(int t=0;t<test.length;++t) {
			System.out.print(test[t]);
			System.out.print(" ");
		}
		System.out.println();*/
        Thread br1 = new Thread(new Bruter(args[0],0,1));
        //Thread br2 = new Thread(new Bruter(args[0],1,2));
        br1.start();
        //br2.start();
    }
}
