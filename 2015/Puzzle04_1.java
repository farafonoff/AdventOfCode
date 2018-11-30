import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Created by faraf on 04.12.2016.
 */
     class Bruter implements Runnable{
        MessageDigest digest;
        String prefix; int start; int step;
        Bruter(String _prefix, int _start, int _step) throws NoSuchAlgorithmException {
            this.prefix = _prefix;
            this.start = _start;
            this.step = _step;
            digest = MessageDigest.getInstance("MD5");
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
                if (out[0]==0&&out[1]==0/*&&out[2]>=0&&out[2]<16*/&&out[2]==0) {
					System.out.println(i);
				}
            }
        }
    }

	
public class Puzzle04_1 {
    public static void main(String[] args) throws NoSuchAlgorithmException {
		/*byte[] test = MessageDigest.getInstance("MD5").digest("abcdef609043".getBytes());
		for(int t=0;t<test.length;++t) {
			System.out.print(test[t]);
			System.out.print(" ");
		}
		System.out.println();*/
        Thread br1 = new Thread(new Bruter(args[0],0,2));
        Thread br2 = new Thread(new Bruter(args[0],1,2));
        br1.start();
        br2.start();
    }
}
